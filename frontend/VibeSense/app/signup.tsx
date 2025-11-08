import { Link } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const emailBorder = useRef(new Animated.Value(0)).current;
  const passBorder = useRef(new Animated.Value(0)).current;
  const confirmBorder = useRef(new Animated.Value(0)).current;
  const underlineAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const animateBorder = (anim: Animated.Value, toValue: number) => {
    Animated.timing(anim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animateUnderline = (toValue: number) => {
    Animated.timing(underlineAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const animateButton = (toValue: number) => {
    Animated.timing(buttonAnim, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const buttonBg = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F72585', '#C51868'],
  });

  return (
    <LinearGradient colors={['#140B33', '#060713']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.logo}>VibeSense</Text>
        <Text style={styles.subtitle}>Create your vibe profile</Text>
      </View>

      <View style={styles.card}>
        <LinearGradient
          colors={['#4F3FFF', '#F72585']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardHeader}
        >
          <Text style={styles.cardTitle}>Sign Up</Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Email */}
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                borderColor: emailBorder.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(90,78,196,0.4)', '#C77DFF'],
                }),
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color="#B9B9FF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8080A8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              onFocus={() => animateBorder(emailBorder, 1)}
              onBlur={() => animateBorder(emailBorder, 0)}
              underlineColorAndroid="transparent"
              selectionColor="#C77DFF"
            />
          </Animated.View>

          {/* Password */}
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                borderColor: passBorder.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(90,78,196,0.4)', '#F72585'],
                }),
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#B9B9FF"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor="#8080A8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => animateBorder(passBorder, 1)}
              onBlur={() => animateBorder(passBorder, 0)}
              underlineColorAndroid="transparent"
              selectionColor="#F72585"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#B9B9FF"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Confirm Password */}
          <Animated.View
            style={[
              styles.inputWrapper,
              {
                borderColor: confirmBorder.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['rgba(90,78,196,0.4)', '#C77DFF'],
                }),
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#B9B9FF"
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm Password"
              placeholderTextColor="#8080A8"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => animateBorder(confirmBorder, 1)}
              onBlur={() => animateBorder(confirmBorder, 0)}
              underlineColorAndroid="transparent"
              selectionColor="#C77DFF"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#B9B9FF"
              />
            </TouchableOpacity>
          </Animated.View>

          <AnimatedTouchable
            style={[styles.primaryButton, { backgroundColor: buttonBg }]}
            activeOpacity={0.85}
            onPressIn={() => animateButton(1)}
            onPressOut={() => animateButton(0)}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </AnimatedTouchable>

          <View style={styles.bottomRow}>
            <Text style={styles.helperText}>Already have an account?</Text>
            <Link href="/login" asChild>
              <TouchableOpacity
                style={styles.linkContainer}
                onPressIn={() => animateUnderline(1)}
                onPressOut={() => animateUnderline(0)}
              >
                <View>
                  <Text style={styles.linkText}>Log in</Text>
                  {Platform.OS === 'web' && (
                    <Animated.View
                      style={[
                        styles.underline,
                        {
                          width: underlineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B1F',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A9AC9',
    marginTop: 4,
  },
  card: {
    width: Math.min(width * 0.85, 340),
    backgroundColor: 'rgba(15,15,40,0.96)',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  form: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,40,0.98)',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  primaryButton: {
    marginTop: 10,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  helperText: {
    color: '#8A8AB0',
    fontSize: 13,
    marginRight: 6,
  },
  linkContainer: {
    alignItems: 'flex-start',
  },
  linkText: {
    color: '#F72585',
    fontSize: 13,
    fontWeight: '600',
  },
  underline: {
    height: 2,
    backgroundColor: '#F72585',
    marginTop: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
});

export default SignupScreen;