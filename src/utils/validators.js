import { PHONE_REGEX, PINCODE_REGEX, EMAIL_REGEX, NAME_REGEX } from '../constants/india';

export const validateName = (name) => {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters';
  if (!NAME_REGEX.test(name.trim())) return 'Name can only contain letters and spaces';
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePhone = (phone) => {
  const cleaned = phone?.replace(/\s/g, '');
  if (!cleaned) return 'Mobile number is required';
  if (!PHONE_REGEX.test(cleaned)) return 'Enter a valid 10-digit Indian mobile number';
  return null;
};

export const validatePincode = (pincode) => {
  if (!pincode) return 'PIN code is required';
  if (!PINCODE_REGEX.test(pincode)) return 'Enter a valid 6-digit PIN code';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateAddress = (address) => {
  const errors = {};
  if (!address.fullName || address.fullName.trim().length < 2) errors.fullName = 'Full name is required';
  const phoneErr = validatePhone(address.phone);
  if (phoneErr) errors.phone = phoneErr;
  if (!address.addressLine1 || address.addressLine1.trim().length < 5) errors.addressLine1 = 'Address is too short (min 5 characters)';
  if (!address.city || address.city.trim().length < 2) errors.city = 'City is required';
  if (!address.state) errors.state = 'State is required';
  const pincodeErr = validatePincode(address.pincode);
  if (pincodeErr) errors.pincode = pincodeErr;
  return errors;
};

export const validateProduct = (product) => {
  const errors = {};
  if (!product.name || product.name.trim().length < 3) errors.name = 'Product name must be at least 3 characters';
  if (!product.price || isNaN(product.price) || Number(product.price) <= 0) errors.price = 'Valid price is required';
  if (!product.category) errors.category = 'Category is required';
  if (!product.description || product.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
  if (!product.stock || isNaN(product.stock) || Number(product.stock) < 0) errors.stock = 'Valid stock quantity is required';
  return errors;
};
