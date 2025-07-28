import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Button = ({ title, onPress, type = 'primary', disabled = false, style = {} }) => {
  const buttonStyle = [
    styles.button,
    type === 'primary' ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style
  ];
  
  const textStyle = [
    styles.buttonText,
    type === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
    disabled && styles.disabledButtonText
  ];
  
  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

// const styles = StyleSheet.create({
//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   primaryButton: {
//     backgroundColor: '#0d6efd',
//   },
//   secondaryButton: {
//     backgroundColor: 'transparent',
//     borderWidth: 1,
//     borderColor: '#0d6efd',
//   },
//   disabledButton: {
//     backgroundColor: '#e9ecef',
//     borderColor: '#e9ecef',
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   primaryButtonText: {
//     color: 'white',
//   },
//   secondaryButtonText: {
//     color: '#0d6efd',
//   },
//   disabledButtonText: {
//     color: '#6c757d',
//   },
// });

export default Button;
