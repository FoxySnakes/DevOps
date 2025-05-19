import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-app-form-example',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './app-form-example.component.html',
  styleUrl: './app-form-example.component.scss'
})
export class AppFormExampleComponent {
  myForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.myForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(15)]],
      prenom: ['', [Validators.required, Validators.maxLength(15)]],
      matricule: ['', [
        Validators.required,
        Validators.pattern('^[0-9]+$'),
        Validators.max(99999)
      ]]
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log(this.myForm.value);
      // Traitement du formulaire ici
    }
  }
}
