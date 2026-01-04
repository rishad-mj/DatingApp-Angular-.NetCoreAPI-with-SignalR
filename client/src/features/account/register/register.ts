import { Component, inject, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterCreds } from '../../../Types/user';
import { AccountService } from '../../../core/services/account-service';
import { TextInput } from '../../../shared/text-input/text-input';
import { Router } from '@angular/router';
import { MemberService } from '../../../core/services/member-service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, TextInput],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private accountService = inject(AccountService);
  private router = inject(Router);
  cancelRegister = output<boolean>();
  protected creds = {} as RegisterCreds;
  protected credentialForm: FormGroup = new FormGroup({});
  protected profileForm: FormGroup = new FormGroup({});
  protected currentStep = signal<number>(1);
  protected validationErrors = signal<string[]>([]);

  constructor(private fb: FormBuilder) {
    //credeintial form step1
    this.credentialForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValue('password')]],
      displayName: ['', Validators.required],
    });

    this.credentialForm.controls['password'].valueChanges.subscribe(() => {
      this.credentialForm.controls['confirmPassword'].updateValueAndValidity();
    });

    //Profile form step2
    this.profileForm = this.fb.group({
      gender: ['male', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  nextStep() {
    if (this.credentialForm.valid) {
      this.currentStep.update((prevStep) => prevStep + 1);
    }
  }

  getMaxDate() {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  }

  prevStep() {
    this.currentStep.update((prevStep) => prevStep - 1);
  }

  matchValue(matchTo: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const matchValue = parent.get(matchTo)?.value;
      return control.value === matchValue ? null : { passwordMismatch: true };
    };
  }

  register() {
    console.log(this.credentialForm.value);

    if (this.credentialForm.valid && this.profileForm.valid) {
      const fromData = { ...this.credentialForm.value, ...this.profileForm.value };
      this.accountService.register(fromData).subscribe({
        next: (user) => {
          this.router.navigateByUrl('/members');
        },
        error: (error: any) => {
          console.error('Registration failed:', error);
          this.validationErrors.set(error);
        },
      });
    }
  }

  cancel(value: boolean) {
    this.cancelRegister.emit(value);
  }
}
