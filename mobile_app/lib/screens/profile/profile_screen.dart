import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../services/api_service.dart';
import '../../constants/states.dart';
import '../auth/login_screen.dart';
import 'saved_articles_screen.dart';
import 'saved_reels_screen.dart';
import 'rewards_screen.dart';
import 'settings_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _userProfile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchProfile();
  }

  Future<void> _fetchProfile() async {
    try {
      final profile = await ApiService.getProfile();
      if (profile['preferredCategories'] != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setStringList('selectedCategories', List<String>.from(profile['preferredCategories']));
      }
      setState(() {
        _userProfile = profile;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load profile: $e')),
        );
      }
    }
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() => _isLoading = true);
      try {
        final bytes = await pickedFile.readAsBytes();
        final uploadedUrl = await ApiService.uploadAvatar(bytes, pickedFile.name);
        
        // Update user profile with new avatar URL
        await ApiService.updateProfile({
          'avatar': uploadedUrl,
        });

        // Refresh profile
        await _fetchProfile();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profile image updated successfully!')),
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to upload image: $e')),
          );
        }
      }
    }
  }

  void _showStateSelectionBottomSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (BuildContext sheetContext) {
        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Select Your State',
                style: GoogleFonts.lexendDeca(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            Expanded(
              child: ListView.builder(
                itemCount: IndianStates.list.length,
                itemBuilder: (context, index) {
                  final state = IndianStates.list[index];
                  return ListTile(
                    title: Text(
                      state,
                      style: GoogleFonts.roboto(fontSize: 16, color: Colors.black),
                    ),
                    trailing: _userProfile?['state'] == state
                        ? const Icon(Icons.check, color: Color(0xFFDC143C))
                        : null,
                    onTap: () async {
                      Navigator.pop(sheetContext);
                      if (_userProfile?['state'] != state) {
                        setState(() => _isLoading = true);
                        try {
                          await ApiService.updateProfile({'state': state});
                          final prefs = await SharedPreferences.getInstance();
                          await prefs.setString('userState', state);
                          await _fetchProfile();
                          if (mounted) {
                            ScaffoldMessenger.of(this.context).showSnackBar(
                              const SnackBar(content: Text('State updated successfully')),
                            );
                          }
                        } catch (e) {
                          setState(() => _isLoading = false);
                          if (mounted) {
                            ScaffoldMessenger.of(this.context).showSnackBar(
                              SnackBar(content: Text('Error updating state: $e')),
                            );
                          }
                        }
                      }
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Profile',
          style: GoogleFonts.lexendDeca(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: Color(0xFFE2E8F0)),
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFFDC143C)))
        : SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              
              // Profile Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24.0),
                child: Container(
                  padding: const EdgeInsets.all(24.0),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(15),
                        blurRadius: 15,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              color: const Color(0xFFF3F4F6),
                              shape: BoxShape.circle,
                              border: Border.all(color: const Color(0xFFE5E7EB), width: 4),
                              image: _userProfile?['avatar'] != null && _userProfile!['avatar'].isNotEmpty
                                  ? DecorationImage(
                                      image: NetworkImage(_userProfile!['avatar']),
                                      fit: BoxFit.cover,
                                    )
                                  : null,
                            ),
                            child: _userProfile?['avatar'] == null || _userProfile!['avatar'].isEmpty
                                ? Center(
                                    child: Text(
                                      _userProfile?['name'] != null && _userProfile!['name'].isNotEmpty
                                          ? _userProfile!['name'].substring(0, 1).toUpperCase()
                                          : 'U',
                                      style: GoogleFonts.roboto(
                                        fontSize: 48,
                                        fontWeight: FontWeight.w600,
                                        color: const Color(0xFF9CA3AF),
                                      ),
                                    ),
                                  )
                                : null,
                          ),
                          GestureDetector(
                            onTap: _pickAndUploadImage,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: Color(0xFFDC143C),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Flexible(
                            child: Text(
                              _userProfile?['name'] ?? 'User Name',
                              style: GoogleFonts.lexendDeca(
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                color: Colors.black,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () async {
                              if (_userProfile != null) {
                                final result = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => EditProfileScreen(userProfile: _userProfile!),
                                  ),
                                );
                                if (result == true) {
                                  _fetchProfile();
                                }
                              }
                            },
                            child: const Icon(Icons.edit_square, color: Color(0xFFDC143C), size: 24),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _userProfile?['email'] ?? 'user@example.com',
                        style: GoogleFonts.roboto(
                          fontSize: 14,
                          color: const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 40),
              
              // Menu List
            _buildMenuItem(
              icon: Icons.bookmark,
              title: 'Saved Articles',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SavedArticlesScreen()),
                );
              },
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            _buildMenuItem(
              icon: Icons.video_library,
              title: 'Saved Reels',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SavedReelsScreen()),
                );
              },
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            _buildMenuItem(
              icon: Icons.card_giftcard,
              title: 'Reward Points',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const RewardsScreen()),
                );
              },
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            _buildMenuItem(
              icon: Icons.settings,
              title: 'Settings',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const SettingsScreen()),
                );
              },
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            _buildMenuItem(
              icon: Icons.location_on,
              title: 'Your State :',
              trailing: _userProfile?['state'] ?? 'Not set',
              onTap: () {
                if (_userProfile != null) {
                  _showStateSelectionBottomSheet();
                }
              },
            ),
            const Divider(height: 1, color: Color(0xFFE2E8F0)),
            
            const SizedBox(height: 60),
            // Logout Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    // Clear user data and route to login
                    await ApiService.logout();
                    if (!context.mounted) return;
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                      (route) => false,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDC143C),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    'Logout',
                    style: GoogleFonts.lexendDeca(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    String? trailing,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Row(
          children: [
            Icon(icon, color: const Color(0xFFDC143C), size: 24),
            const SizedBox(width: 16),
            Text(
              title,
              style: GoogleFonts.roboto(
                fontSize: 16,
                color: Colors.black,
              ),
            ),
            if (trailing != null) ...[
              const SizedBox(width: 8),
              Text(
                trailing,
                style: GoogleFonts.roboto(
                  fontSize: 16,
                  color: const Color(0xFFDC143C),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
