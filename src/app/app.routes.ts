import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ArticleDetail } from './pages/article-detail/article-detail';
import { Admin } from './pages/admin/admin';
import { ArticleManagement } from './pages/article-management/article-management';
import { CategoryPage } from './pages/category/category';
import { LoginPage } from './pages/login/login';
import { SignupPage } from './pages/signup/signup';
import { AdminLoginPage } from './pages/admin-login/admin-login';
import { SearchPage } from './pages/search/search';
import { UserManagement } from './pages/user-management/user-management';
import { ProfilePage } from './pages/profile/profile';
import { AboutPage } from './pages/about/about';
import { ContactPage } from './pages/contact/contact';
import { PrivacyPage } from './pages/privacy/privacy';
import { TermsPage } from './pages/terms/terms';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'article/:slug', component: ArticleDetail },
  { path: 'login', component: LoginPage },
  { path: 'admin-login', component: AdminLoginPage },
  { path: 'signup', component: SignupPage },
  { path: 'search', component: SearchPage },
  { path: 'about', component: AboutPage },
  { path: 'contact', component: ContactPage },
  { path: 'privacy', component: PrivacyPage },
  { path: 'terms', component: TermsPage },
  { path: 'admin', component: Admin, canActivate: [authGuard] },
  { path: 'admin/articles', component: ArticleManagement, canActivate: [authGuard] },
  { path: 'admin/users', component: UserManagement, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'category/:name', component: CategoryPage },
];
