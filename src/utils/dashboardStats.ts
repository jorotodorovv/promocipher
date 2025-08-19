export interface DashboardStatsData {
  activeCodes: number;
  expiringSoon: number;
  expiredCodes: number;
}

export const calculateDashboardStats = (promoCodes: any[]): DashboardStatsData => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  let activeCodes = 0;
  let expiringSoon = 0;
  let expiredCodes = 0;
  
  promoCodes.forEach((code: any) => {
    const expiryDate = new Date(code.expires);
    
    if (expiryDate >= now) {
      // Count active codes (not expired)
      activeCodes++;
      
      // Count expiring soon (within 30 days)
      if (expiryDate <= thirtyDaysFromNow) {
        expiringSoon++;
      }
    } else {
      // Count expired codes
      expiredCodes++;
    }
  });
  
  return {
    activeCodes,
    expiringSoon,
    expiredCodes
  };
};