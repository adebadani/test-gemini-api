const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Get git diffs for all changed files in the PR
 */
function getFileDiffs(changedFiles, baseBranch) {
  let fileContents = '';

  for (const file of changedFiles) {
    try {
      const diff = execSync(`git diff origin/${baseBranch}...HEAD -- ${file}`, { encoding: 'utf8' });

      fileContents += `
      ====================================
      FILE: ${file}
      ====================================

      ${diff}
      `;
    } catch (e) {
      console.log(`Skipping file with no diff: ${file}`);
    }
  }

  return fileContents;
}

/**
 * Build the prompt for Gemini API
 */
function buildPrompt(repository, prNumber, changedFiles, fileContents) {
  return `
    REPO: ${repository}
    PR NUMBER: ${prNumber}

    You are a Senior Software Engineer performing a thorough code review.

    REVIEW PRINCIPLES:
    1. CRITICAL THINKING - Challenge assumptions, identify redundant code, suggest better alternatives
    2. CODE QUALITY - Best practices, error handling, readability, maintainability
    3. SECURITY - Vulnerabilities, input sanitization, authentication/authorization
    4. PERFORMANCE - Bottlenecks, efficiency, memory leaks, scalability
    5. TESTING - Coverage, edge cases, test quality
    6. FUTURE-ORIENTED - Modular design, extensibility, avoid tight coupling

    When reviewing, consider:
    * Is this code intuitive and maintainable?
    * Are there edge cases not handled?
    * Can this be simplified without losing functionality?
    * Are there security risks or performance issues?
    * Is the architecture scalable and extensible?

    CHANGED FILES:
    ${changedFiles.join('\n')}

    GIT DIFFS (only changed lines):
    ${fileContents}

    OUTPUT FORMAT (strict JSON):
    Return ONLY valid JSON with this structure:
    {
      "issues": [
        {
          "file": "src/file.ts",
          "line": 10,
          "type": "Security",
          "description": "SQL injection vulnerability",
          "code_snippet": "const query = \"SELECT * FROM users WHERE id = \" + userId;"
        }
      ]
    }

    IMPORTANT:
    - Return ONLY the JSON, no markdown formatting
    - Line numbers must be integers
    - Files must be from the changed files list
    - Focus on actual issues, not theoretical concerns
    - Be direct and actionable
  `;
}

/**
 * Parse retry delay from API error response
 */
function parseRetryDelay(errorDetails) {
  if (!errorDetails) return null;
  for (const detail of errorDetails) {
    if (detail.retryDelay) {
      const match = detail.retryDelay.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]) * 1000;
      }
    }
  }
  return null;
}

/**
 * Call Gemini API with retry logic
 */
async function callGeminiAPI(prompt, apiKey) {
  const maxRetries = 3;
  const initialDelay = 2000;
  let retryCount = 0;
  let data;
  let lastError;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              topP: 0.9,
              topK: 20,
              maxOutputTokens: 32768
            }
          })
        }
      );

      data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        break;
      }

      if (response.status === 429) {
        const apiDelay = parseRetryDelay(data?.error?.details);
        const exponentialDelay = initialDelay * Math.pow(2, retryCount);
        const delayMs = apiDelay || exponentialDelay;
        console.log(`Quota exceeded. Retrying in ${delayMs/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retryCount++;
        lastError = data.error?.message || 'Quota exceeded';
        continue;
      }

      console.log(JSON.stringify(data, null, 2));
      throw new Error(`Invalid Gemini response: ${data.error?.message || 'Unknown error'}`);

    } catch (error) {
      if (retryCount < maxRetries - 1) {
        const delayMs = initialDelay * Math.pow(2, retryCount);
        console.log(`Error occurred. Retrying in ${delayMs/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retryCount++;
        lastError = error.message;
      } else {
        throw error;
      }
    }
  }

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.log(JSON.stringify(data, null, 2));
    throw new Error(`Invalid Gemini response after ${maxRetries} retries. Last error: ${lastError}`);
  }

  return data.candidates[0].content.parts[0].text;
}

/**
 * Parse JSON response from Gemini
 */
function parseReviewResponse(reviewText) {
  let jsonText = reviewText.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json\n/, '').replace(/^```\n/, '').replace(/```$/, '');
  }

  try {
    return JSON.parse(jsonText);
  } catch (e) {
    // Try to handle incomplete JSON by finding the last complete object
    console.log('Failed to parse JSON, attempting to recover from truncated response');
    
    // Try to find the last complete "issues" array entry
    const lastBraceIndex = jsonText.lastIndexOf('}');
    if (lastBraceIndex > 0) {
      const lastClosingBracket = jsonText.lastIndexOf(']');
      if (lastClosingBracket > 0) {
        // Try to reconstruct the JSON by closing the array and object
        const reconstructed = jsonText.substring(0, lastClosingBracket + 1) + '\n}';
        try {
          const parsed = JSON.parse(reconstructed);
          console.log('Successfully parsed truncated JSON');
          return parsed;
        } catch (e2) {
          console.log('Reconstruction failed, trying alternative method');
        }
      }
    }
    
    console.log('Failed to parse JSON, raw response length:', jsonText.length);
    console.log('Raw response (first 500 chars):', jsonText.substring(0, 500));
    console.log('Raw response (last 500 chars):', jsonText.substring(Math.max(0, jsonText.length - 500)));
    throw new Error('Failed to parse Gemini response as JSON - response may be truncated');
  }
}

/**
 * Determine PR number from context
 */
function getPRNumber(context) {
  if (context.payload.pull_request?.number) {
    return context.payload.pull_request.number;
  } else if (context.payload.number) {
    return context.payload.number;
  } else if (context.payload.issue?.number) {
    return context.payload.issue.number;
  }
  return null;
}

/**
 * Build review comments from review data
 */
function buildReviewComments(reviewData) {
  const comments = [];
  const generalComments = [];

  if (reviewData.issues && Array.isArray(reviewData.issues)) {
    for (const issue of reviewData.issues) {
      if (issue.file && issue.line) {
        try {
          const fileContent = fs.readFileSync(issue.file, 'utf8');
          const lines = fileContent.split('\n');
          if (issue.line > 0 && issue.line <= lines.length) {
            const commentBody = `**${issue.type || 'Issue'}**: ${issue.description}\n\n\`\`\`\n${issue.code_snippet || ''}\n\`\`\``;
            comments.push({
              path: issue.file,
              line: issue.line,
              body: commentBody
            });
          } else {
            generalComments.push(`**${issue.type || 'Issue'}** in \`${issue.file}\` (line ${issue.line}): ${issue.description}\n\n\`\`\`\n${issue.code_snippet || ''}\n\`\`\``);
          }
        } catch (e) {
          generalComments.push(`**${issue.type || 'Issue'}** in \`${issue.file}\` (line ${issue.line}): ${issue.description}\n\n\`\`\`\n${issue.code_snippet || ''}\n\`\`\``);
        }
      } else if (issue.file) {
        generalComments.push(`**${issue.type || 'Issue'}** in \`${issue.file}\`: ${issue.description}\n\n\`\`\`\n${issue.code_snippet || ''}\n\`\`\``);
      }
    }
  }

  return { comments, generalComments };
}

/**
 * Main function to run the review
 */
async function runReview(context, github, env) {
  const changedFiles = env.FILES.split(' ').filter(Boolean);
  const baseBranch = context.payload.pull_request?.base?.ref || 'main';
  const repository = context.payload.repository?.full_name || 'unknown';
  const prNumber = getPRNumber(context);

  console.log('Event name:', context.event_name);
  console.log('Payload keys:', Object.keys(context.payload));
  console.log('Determined PR number:', prNumber);

  // Get file diffs
  const fileContents = getFileDiffs(changedFiles, baseBranch);

  // Build prompt
  const prompt = buildPrompt(repository, prNumber, changedFiles, fileContents);

  // Estimate tokens
  const estimatedTokens = Math.ceil(prompt.length / 4);
  console.log(`Estimated input tokens: ${estimatedTokens}`);

  // Call Gemini API
  const reviewText = await callGeminiAPI(prompt, env.GEMINI_API_KEY);

  // Parse response
  const reviewData = parseReviewResponse(reviewText);

  // Build comments
  const { comments, generalComments } = buildReviewComments(reviewData);

  // Create review
  if (prNumber) {
    if (comments.length === 0 && generalComments.length === 0) {
      console.log('No issues found, skipping review creation');
      return;
    }

    const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber
    });
    const commitId = pr.data.head.sha;

    const reviewBody = generalComments.length > 0 ? generalComments.join('\n\n---\n\n') : '';
    await github.rest.pulls.createReview({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
      commit_id: commitId,
      body: reviewBody,
      comments: comments,
      event: (comments.length > 0 || generalComments.length > 0) ? 'REQUEST_CHANGES' : 'COMMENT'
    });
  } else {
    console.log('No valid PR number found, skipping review');
  }
}

module.exports = { runReview };
