import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../setup/preferences_screen.dart';
import '../../services/api_service.dart';
import '../../constants/states.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailPhoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _referralController = TextEditingController();
  bool _obscurePassword = true;
  bool _isMobileMode = false;
  bool _isLoading = false;
  String? _selectedState;

  @override
  void initState() {
    super.initState();
    _emailPhoneController.addListener(() {
      final input = _emailPhoneController.text.trim();
      final isMobile = RegExp(r'^[0-9]+$').hasMatch(input);
      if (isMobile != _isMobileMode && input.isNotEmpty) {
        setState(() {
          _isMobileMode = isMobile;
        });
      } else if (input.isEmpty && _isMobileMode) {
        setState(() {
          _isMobileMode = false;
        });
      }
    });
  }

  Future<void> _handleSignup() async {
    if (_isMobileMode) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Mobile OTP signup is not available yet. Please use email.')),
      );
      return;
    }

    final name = _fullNameController.text.trim();
    final email = _emailPhoneController.text.trim();
    final password = _passwordController.text;
    final referralCode = _referralController.text.trim();

    if (name.isEmpty || email.isEmpty || password.isEmpty || _selectedState == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields and select a state')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      await ApiService.register(name, email, password, _selectedState!, referralCode: referralCode.isNotEmpty ? referralCode : null);
      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const PreferencesScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString().replaceAll('Exception: ', '');
      String displayMsg = 'Sign-up failed. Please try again.';
      if (msg.toLowerCase().contains('user already exists') || msg.toLowerCase().contains('email already in use')) {
        displayMsg = 'Email already in use.';
      } else if (msg.isNotEmpty) {
        displayMsg = msg;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(displayMsg)),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        serverClientId: const String.fromEnvironment('GOOGLE_CLIENT_ID', defaultValue: ''),
      );
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

      if (googleUser == null) {
        if (!mounted) return;
        setState(() => _isLoading = false);
        return; // The user canceled the sign-in
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      if (googleAuth.idToken == null) {
        throw Exception('Missing Google ID Token');
      }

      await ApiService.googleLogin(
        googleAuth.idToken!,
        googleUser.displayName ?? 'Google User',
        googleUser.email,
        googleUser.photoUrl ?? '',
        googleUser.id,
      );

      if (!mounted) return;
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const PreferencesScreen()),
        (route) => false,
      );
    } on PlatformException catch (e) {
      if (!mounted) return;
      String errorMessage = 'Google Sign-In failed. Please try again.';
      if (e.code == 'sign_in_failed') {
        if (e.message?.contains('10') == true) {
          errorMessage = 'Google Sign-In configuration error. Please update your Firebase SHA-1 keys and download the latest google-services.json.';
        } else if (e.code == 'sign_in_canceled') {
          errorMessage = 'Sign-in cancelled by user.';
        }
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errorMessage)),
      );
    } catch (error) {
      if (!mounted) return;
      final msg = error.toString().replaceAll('Exception: ', '');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg)),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 48.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 20),
              // Logo
              Image.asset(
                'assets/images/logo.png',
                width: 200, // Explicit width for the horizontal text logo
                fit: BoxFit.contain,
              ),
              const SizedBox(height: 50),
              // Full Name Field
              TextField(
                controller: _fullNameController,
                decoration: InputDecoration(
                  hintText: 'Full Name',
                  hintStyle: GoogleFonts.lexendDeca(
                    color: const Color(0xFF94A3B8),
                    fontSize: 14,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFDC143C)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // State Dropdown
              DropdownButtonFormField<String>(
                initialValue: _selectedState,
                hint: Text(
                  'Select your State',
                  style: GoogleFonts.lexendDeca(
                    color: const Color(0xFF94A3B8),
                    fontSize: 14,
                  ),
                ),
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFDC143C)),
                  ),
                ),
                items: IndianStates.list.map((String state) {
                  return DropdownMenuItem<String>(
                    value: state,
                    child: Text(
                      state,
                      style: GoogleFonts.lexendDeca(
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: (String? newValue) {
                  setState(() {
                    _selectedState = newValue;
                  });
                },
              ),
              const SizedBox(height: 16),
              // Email / Phone Field
              TextField(
                controller: _emailPhoneController,
                decoration: InputDecoration(
                  hintText: 'Email or Phone',
                  hintStyle: GoogleFonts.lexendDeca(
                    color: const Color(0xFF94A3B8),
                    fontSize: 14,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFDC143C)),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Password Field
              if (!_isMobileMode)
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    hintText: 'Password',
                    hintStyle: GoogleFonts.lexendDeca(
                      color: const Color(0xFF94A3B8),
                      fontSize: 14,
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFFDC143C)),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility : Icons.visibility_off,
                        color: Colors.black,
                      ),
                      onPressed: () {
                        setState(() {
                          _obscurePassword = !_obscurePassword;
                        });
                      },
                    ),
                  ),
                ),
              const SizedBox(height: 16),
              // Referral Code Field
              TextField(
                controller: _referralController,
                decoration: InputDecoration(
                  hintText: 'Referral Code (Optional)',
                  hintStyle: GoogleFonts.lexendDeca(
                    color: const Color(0xFF94A3B8),
                    fontSize: 14,
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFDC143C)),
                  ),
                ),
              ),
              if (!_isMobileMode) const SizedBox(height: 32),
              // Sign Up Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleSignup,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC143C),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : Text(
                          _isMobileMode ? 'Send OTP' : 'Sign Up',
                          style: GoogleFonts.lexendDeca(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 32),
              // Divider
              Row(
                children: [
                  const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Or continue with',
                      style: GoogleFonts.roboto(
                        color: const Color(0xFF979797),
                        fontSize: 14,
                      ),
                    ),
                  ),
                  const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                ],
              ),
              const SizedBox(height: 32),
              // Google Button
              SizedBox(
                width: 200,
                child: OutlinedButton(
                  onPressed: _isLoading ? null : _handleGoogleSignIn,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    side: const BorderSide(color: Colors.black, width: 1.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.g_mobiledata, color: Colors.black, size: 32),
                      const SizedBox(width: 4),
                      Text(
                        'Google',
                        style: GoogleFonts.roboto(
                          color: Colors.black,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 50),
              // Footer
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have an account? ',
                    style: GoogleFonts.roboto(
                      color: const Color(0xFF979797),
                      fontSize: 14,
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pop(context);
                    },
                    child: Text(
                      'Login',
                      style: GoogleFonts.roboto(
                        color: const Color(0xFFDC143C),
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
