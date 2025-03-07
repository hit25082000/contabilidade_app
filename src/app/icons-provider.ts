import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { 
  MailOutline, 
  LockOutline, 
  EyeOutline, 
  EyeInvisibleOutline,
  UserOutline,
  AuditOutline,
  DashboardOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  BellOutline,
  LogoutOutline,
  SettingOutline,
  AccountBookFill,
  FilePdfOutline,
  AlertOutline,
  TeamOutline,
  FileTextOutline,
  CalendarOutline,
  BarChartOutline,
  ClockCircleOutline,
  UnorderedListOutline,
  PlusOutline,
  FileDoneOutline,
  FileExclamationOutline,
  IdcardOutline,
  PhoneOutline,
  UserAddOutline
} from '@ant-design/icons-angular/icons';

// Ícones que serão utilizados na aplicação
const icons = [
  MailOutline, 
  LockOutline, 
  EyeOutline, 
  EyeInvisibleOutline,
  UserOutline,
  AuditOutline,
  DashboardOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  BellOutline,
  LogoutOutline,
  SettingOutline,
  AccountBookFill,
  FilePdfOutline,
  AlertOutline,
  TeamOutline,
  FileTextOutline,
  CalendarOutline,
  BarChartOutline,
  ClockCircleOutline,
  UnorderedListOutline,
  PlusOutline,
  FileDoneOutline,
  FileExclamationOutline,
  IdcardOutline,
  PhoneOutline,
  UserAddOutline
];

/**
 * Provedor de ícones para o NG-ZORRO
 * Carrega apenas os ícones necessários para a aplicação
 */
export function provideNzIcons(): EnvironmentProviders {
  return importProvidersFrom(
    NzIconModule.forRoot(icons)
  );
} 