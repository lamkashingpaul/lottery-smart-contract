export const getAddressInitials = (address: string): string => {
  return address.slice(2, 4).toUpperCase();
};
