/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext } from 'react';
import { ENV } from '../config/env';

// Repositories
import type { MetricRepository } from '../../domain/repositories/MetricRepository';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import type { LiveActivityRepository } from '../../domain/repositories/LiveActivityRepository';
import type { TaskRepository } from '../../domain/repositories/TaskRepository';
import type { PaymentRepository } from '../../domain/repositories/PaymentRepository';
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import type { CraftsmanRepository } from '../../domain/repositories/CraftsmanRepository';
import type { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import type { VerificationRepository } from '../../domain/repositories/VerificationRepository';
import type { SafetyReportRepository } from '../../domain/repositories/SafetyReportRepository';
import type { BroadcastRepository } from '../../domain/repositories/BroadcastRepository';
import type { AdRepository } from '../../domain/repositories/AdRepository';
import type { DisputeRepository } from '../../domain/repositories/DisputeRepository';
import type { ChatRepository } from '../../domain/repositories/ChatRepository';

// Mock Repositories
import { MockMetricRepository } from '../../data/repositories/MockMetricRepository';
import { MockAuthRepository } from '../../data/repositories/MockAuthRepository';
import { MockLiveActivityRepository } from '../../data/repositories/MockLiveActivityRepository';
import { MockTaskRepository } from '../../data/repositories/MockTaskRepository';
import { MockPaymentRepository } from '../../data/repositories/MockPaymentRepository';
import { MockCategoryRepository } from '../../data/repositories/MockCategoryRepository';
import { MockCraftsmanRepository } from '../../data/repositories/MockCraftsmanRepository';
import { MockNotificationRepository } from '../../data/repositories/MockNotificationRepository';
import { MockVerificationRepository } from '../../data/repositories/MockVerificationRepository';
import { MockSafetyReportRepository } from '../../data/repositories/MockSafetyReportRepository';
import { MockBroadcastRepository } from '../../data/repositories/MockBroadcastRepository';
import { MockAdRepository } from '../../data/repositories/MockAdRepository';
import { MockDisputeRepository } from '../../data/repositories/MockDisputeRepository';
import { MockChatRepository } from '../../data/repositories/MockChatRepository';

// Api Repositories
import { ApiMetricRepository } from '../../data/repositories/ApiMetricRepository';
import { ApiAuthRepository } from '../../data/repositories/ApiAuthRepository';
import { ApiLiveActivityRepository } from '../../data/repositories/ApiLiveActivityRepository';
import { ApiTaskRepository } from '../../data/repositories/ApiTaskRepository';
import { ApiPaymentRepository } from '../../data/repositories/ApiPaymentRepository';
import { ApiCategoryRepository } from '../../data/repositories/ApiCategoryRepository';
import { ApiCraftsmanRepository } from '../../data/repositories/ApiCraftsmanRepository';
import { ApiNotificationRepository } from '../../data/repositories/ApiNotificationRepository';
import { ApiVerificationRepository } from '../../data/repositories/ApiVerificationRepository';
import { ApiSafetyReportRepository } from '../../data/repositories/ApiSafetyReportRepository';
import { ApiBroadcastRepository } from '../../data/repositories/ApiBroadcastRepository';
import { ApiAdRepository } from '../../data/repositories/ApiAdRepository';
import { ApiDisputeRepository } from '../../data/repositories/ApiDisputeRepository';
import { ApiChatRepository } from '../../data/repositories/ApiChatRepository';

// Use Cases
import { LoginUseCase } from '../../domain/use_cases/auth/LoginUseCase';
import { LogoutUseCase } from '../../domain/use_cases/auth/LogoutUseCase';
import { GetCurrentUserUseCase } from '../../domain/use_cases/auth/GetCurrentUserUseCase';
import { GetDashboardMetricsUseCase } from '../../domain/use_cases/dashboard/GetDashboardMetricsUseCase';
import { GetTasksUseCase } from '../../domain/use_cases/tasks/GetTasksUseCase';
import { FreezeTaskUseCase, UnfreezeTaskUseCase } from '../../domain/use_cases/tasks/FreezeTaskUseCase';
import { GetCategoriesUseCase } from '../../domain/use_cases/service_management/GetCategoriesUseCase';
import { CreateCategoryUseCase } from '../../domain/use_cases/service_management/CreateCategoryUseCase';
import {
  UpdateCategoryVisibilityUseCase,
  GetSubcategoriesUseCase,
  CreateSubcategoryUseCase,
  UpdateSubcategoryVisibilityUseCase,
  GetFormFieldsUseCase,
  ToggleFieldRequiredUseCase,
  DeleteFieldUseCase,
  CreateFieldUseCase
} from '../../domain/use_cases/service_management/ServiceManagementUseCases';

interface Repositories {
  metricRepository: MetricRepository;
  authRepository: AuthRepository;
  liveActivityRepository: LiveActivityRepository;
  taskRepository: TaskRepository;
  paymentRepository: PaymentRepository;
  categoryRepository: CategoryRepository;
  craftsmanRepository: CraftsmanRepository;
  notificationRepository: NotificationRepository;
  verificationRepository: VerificationRepository;
  safetyReportRepository: SafetyReportRepository;
  broadcastRepository: BroadcastRepository;
  adRepository: AdRepository;
  disputeRepository: DisputeRepository;
  chatRepository: ChatRepository;
}

interface UseCases {
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
  getDashboardMetricsUseCase: GetDashboardMetricsUseCase;
  getTasksUseCase: GetTasksUseCase;
  freezeTaskUseCase: FreezeTaskUseCase;
  unfreezeTaskUseCase: UnfreezeTaskUseCase;
  getCategoriesUseCase: GetCategoriesUseCase;
  createCategoryUseCase: CreateCategoryUseCase;
  updateCategoryVisibilityUseCase: UpdateCategoryVisibilityUseCase;
  getSubcategoriesUseCase: GetSubcategoriesUseCase;
  createSubcategoryUseCase: CreateSubcategoryUseCase;
  updateSubcategoryVisibilityUseCase: UpdateSubcategoryVisibilityUseCase;
  getFormFieldsUseCase: GetFormFieldsUseCase;
  toggleFieldRequiredUseCase: ToggleFieldRequiredUseCase;
  deleteFieldUseCase: DeleteFieldUseCase;
  createFieldUseCase: CreateFieldUseCase;
}

interface DependencyContextType {
  repositories: Repositories;
  dependencies: Repositories; // Alias for backward compatibility
  useCases: UseCases;
  isApiMode: boolean;
}

const DependencyContext = createContext<DependencyContextType | undefined>(undefined);

// Instantiate Singletons
const mockMetricRepository = new MockMetricRepository();
const apiMetricRepository = new ApiMetricRepository();

const mockAuthRepository = new MockAuthRepository();
const apiAuthRepository = new ApiAuthRepository();

const mockLiveActivityRepository = new MockLiveActivityRepository();
const apiLiveActivityRepository = new ApiLiveActivityRepository();

const mockTaskRepository = new MockTaskRepository();
const apiTaskRepository = new ApiTaskRepository();

const mockPaymentRepository = new MockPaymentRepository();
const apiPaymentRepository = new ApiPaymentRepository();

const mockCategoryRepository = new MockCategoryRepository();
const apiCategoryRepository = new ApiCategoryRepository();

const mockCraftsmanRepository = new MockCraftsmanRepository();
const apiCraftsmanRepository = new ApiCraftsmanRepository();

const mockNotificationRepository = new MockNotificationRepository();
const apiNotificationRepository = new ApiNotificationRepository();

const mockVerificationRepository = new MockVerificationRepository();
const apiVerificationRepository = new ApiVerificationRepository();

const mockSafetyReportRepository = new MockSafetyReportRepository();
const apiSafetyReportRepository = new ApiSafetyReportRepository();

const mockBroadcastRepository = new MockBroadcastRepository();
const apiBroadcastRepository = new ApiBroadcastRepository();

const mockAdRepository = new MockAdRepository();
const apiAdRepository = new ApiAdRepository();

const mockDisputeRepository = new MockDisputeRepository();
const apiDisputeRepository = new ApiDisputeRepository();

const mockChatRepository = new MockChatRepository();
const apiChatRepository = new ApiChatRepository();

export const DependencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isApiMode = !ENV.USE_MOCK;

  const currentRepositories: Repositories = {
    metricRepository: isApiMode ? apiMetricRepository : mockMetricRepository,
    authRepository: isApiMode ? apiAuthRepository : mockAuthRepository,
    liveActivityRepository: isApiMode ? apiLiveActivityRepository : mockLiveActivityRepository,
    taskRepository: isApiMode ? apiTaskRepository : mockTaskRepository,
    paymentRepository: isApiMode ? apiPaymentRepository : mockPaymentRepository,
    categoryRepository: isApiMode ? apiCategoryRepository : mockCategoryRepository,
    craftsmanRepository: isApiMode ? apiCraftsmanRepository : mockCraftsmanRepository,
    notificationRepository: isApiMode ? apiNotificationRepository : mockNotificationRepository,
    verificationRepository: isApiMode ? apiVerificationRepository : mockVerificationRepository,
    safetyReportRepository: isApiMode ? apiSafetyReportRepository : mockSafetyReportRepository,
    broadcastRepository: isApiMode ? apiBroadcastRepository : mockBroadcastRepository,
    adRepository: isApiMode ? apiAdRepository : mockAdRepository,
    disputeRepository: isApiMode ? apiDisputeRepository : mockDisputeRepository,
    chatRepository: isApiMode ? apiChatRepository : mockChatRepository,
  };

  // Bind Use Cases with appropriate repository dependencies
  const currentUseCases: UseCases = {
    loginUseCase: new LoginUseCase(currentRepositories.authRepository),
    logoutUseCase: new LogoutUseCase(currentRepositories.authRepository),
    getCurrentUserUseCase: new GetCurrentUserUseCase(currentRepositories.authRepository),
    getDashboardMetricsUseCase: new GetDashboardMetricsUseCase(currentRepositories.metricRepository),
    getTasksUseCase: new GetTasksUseCase(currentRepositories.taskRepository),
    freezeTaskUseCase: new FreezeTaskUseCase(currentRepositories.taskRepository),
    unfreezeTaskUseCase: new UnfreezeTaskUseCase(currentRepositories.taskRepository),
    getCategoriesUseCase: new GetCategoriesUseCase(currentRepositories.categoryRepository),
    createCategoryUseCase: new CreateCategoryUseCase(currentRepositories.categoryRepository),
    updateCategoryVisibilityUseCase: new UpdateCategoryVisibilityUseCase(currentRepositories.categoryRepository),
    getSubcategoriesUseCase: new GetSubcategoriesUseCase(currentRepositories.categoryRepository),
    createSubcategoryUseCase: new CreateSubcategoryUseCase(currentRepositories.categoryRepository),
    updateSubcategoryVisibilityUseCase: new UpdateSubcategoryVisibilityUseCase(currentRepositories.categoryRepository),
    getFormFieldsUseCase: new GetFormFieldsUseCase(currentRepositories.categoryRepository),
    toggleFieldRequiredUseCase: new ToggleFieldRequiredUseCase(currentRepositories.categoryRepository),
    deleteFieldUseCase: new DeleteFieldUseCase(currentRepositories.categoryRepository),
    createFieldUseCase: new CreateFieldUseCase(currentRepositories.categoryRepository),
  };

  return (
    <DependencyContext.Provider value={{ repositories: currentRepositories, dependencies: currentRepositories, useCases: currentUseCases, isApiMode }}>
      {children}
    </DependencyContext.Provider>
  );
};

export const useDependencies = () => {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error('useDependencies must be used within a DependencyProvider');
  }
  return context;
};

export default DependencyProvider;
