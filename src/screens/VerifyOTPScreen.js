import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackArrow from '../components/BackArrow';
import { verifyPasswordResetOTP, requestPasswordResetOTP } from '../services/api';

const VerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    // Start countdown for resend button
    if (resendDisabled) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [resendDisabled]);

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      text = text[0]; // Only allow one character
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus next input if text entered
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // When backspace is pressed on an empty input, focus previous input
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await requestPasswordResetOTP(email);
      
      if (response.success) {
        Alert.alert('Success', 'OTP sent successfully to your email');
        // Reset countdown
        setCountdown(60);
        setResendDisabled(true);
      } else {
        Alert.alert('Error', response.msg || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter a complete 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      const response = await verifyPasswordResetOTP(email, otpString);
      
      if (response.success && response.resetToken) {
        // Navigate to reset password screen with token
        navigation.navigate('ResetPassword', { 
          email, 
          resetToken: response.resetToken 
        });
      } else {
        Alert.alert('Error', response.msg || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <BackArrow />
      </TouchableOpacity>

      <Text style={styles.title}>Verify Your Email</Text>
      
      <Text style={styles.description}>
        We have sent a verification code to your email {email}
      </Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
          />
        ))}
      </View>

      <TouchableOpacity 
        style={styles.continueButton} 
        onPress={handleVerifyOTP}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.continueButtonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive code? </Text>
        {resendDisabled ? (
          <Text style={styles.countdown}>Resend in {countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  otpInput: {
    width: 45,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#F4821F',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    color: '#666666',
    fontSize: 14,
  },
  resendLink: {
    color: '#F4821F',
    fontSize: 14,
    fontWeight: '600',
  },
  countdown: {
    color: '#888888',
    fontSize: 14,
  },
});

export default VerifyOTPScreen; 