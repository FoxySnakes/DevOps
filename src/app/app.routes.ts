import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { AppFormExampleComponent } from './app-form-example/app-form-example.component';

export const routes: Routes = [
    { path: "", component: AppComponent},
    { path: "hw", component: HelloWorldComponent},
    { path: "form", component: AppFormExampleComponent}
];
