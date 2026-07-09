import { AppError, ValidationError } from './AppError';

export class ErrorToastMapper {
  public static toMessage(error: AppError, locale = 'en'): string {
    const isAr = locale === 'ar';

    switch (error.code) {
      case 'NETWORK_ERROR':
        return isAr 
          ? 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.' 
          : 'Network error. Please check your internet connection.';
      
      case 'UNAUTHORIZED_ERROR':
        return isAr 
          ? 'جلسة العمل انتهت. يرجى تسجيل الدخول مرة أخرى.' 
          : 'Session expired. Please log in again.';
      
      case 'FORBIDDEN_ERROR':
        return isAr 
          ? 'ليس لديك الصلاحية لإجراء هذه العملية.' 
          : 'You do not have permission to perform this action.';
      
      case 'NOT_FOUND_ERROR':
        return isAr 
          ? 'المورد المطلوب غير موجود.' 
          : 'The requested resource was not found.';
      
      case 'TIMEOUT_ERROR':
        return isAr 
          ? 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى لاحقاً.' 
          : 'Request timeout. Please try again later.';
      
      case 'VALIDATION_ERROR': {
        const valError = error as ValidationError;
        if (valError.details.length > 0) {
          const detailMsgs = valError.details.map(d => `${d.field}: ${d.message}`).join(', ');
          return isAr 
            ? `بيانات غير صالحة: ${detailMsgs}` 
            : `Validation failed: ${detailMsgs}`;
        }
        return valError.message;
      }
      
      case 'SERVER_ERROR':
        return isAr 
          ? 'حدث خطأ في الخادم الداخلي. يرجى المحاولة لاحقاً.' 
          : 'Internal server error. Please try again later.';
      
      default:
        return error.message || (isAr ? 'حدث خطأ غير متوقع.' : 'An unexpected error occurred.');
    }
  }
}
