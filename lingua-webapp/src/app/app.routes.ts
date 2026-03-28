import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { StudentComponent } from './Components/student/student';
import { Admins } from './Components/admins/admins';
import { DictionaryComponent } from './Components/dictionary/dictionary';
import { Lessons } from './Components/lessons/lessons';
import { PostComponent } from './Components/post/post';
import { Dashboard } from './Components/dashboard/dashboard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'student', component: StudentComponent },
    { path: 'admins', component: Admins},
     { path: 'dictionary', component: DictionaryComponent},
     { path: 'lesson', component: Lessons},
     { path: 'posts', component: PostComponent},
     { path: 'dashboard', component: Dashboard},
];
