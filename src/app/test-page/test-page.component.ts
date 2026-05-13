import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test-page',
  imports: [RouterLink],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.css'
})
export class TestPageComponent {
  counter = 0;
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  increment() {
    this.counter++;
  }

  decrement() {
    this.counter--;
  }
}
