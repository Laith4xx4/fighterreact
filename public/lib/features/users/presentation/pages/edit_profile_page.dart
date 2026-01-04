import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:thesavage/core/app_theme.dart';
import 'package:thesavage/core/role_helper.dart';

class EditProfilePage extends StatefulWidget {
  const EditProfilePage({super.key});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _formKey = GlobalKey<FormState>();
  
  // Controllers
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;

  bool _isLoading = true;
  String _userRole = "Member";

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _emailController = TextEditingController();
    _phoneController = TextEditingController();
    _bioController = TextEditingController();
    _loadUserData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    
    // Simulate loading or fetch from AuthCubit/Repository in real app
    // Here we load from SharedPreferences which are set on login
    String? firstName = prefs.getString("firstName");
    String? lastName = prefs.getString("lastName");
    String fullName = "$firstName $lastName".trim();
    if (fullName.isEmpty) fullName = prefs.getString("userName") ?? "";

    setState(() {
      _nameController.text = fullName;
      _emailController.text = prefs.getString("userEmail") ?? "";
      _phoneController.text = ""; // Phone might be in specific profile Fetch
      _bioController.text = ""; // Bio might be in specific profile Fetch
      _userRole = prefs.getString("userRole") ?? "Member";
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppTheme.backgroundColor,
        body: Center(child: CircularProgressIndicator(color: AppTheme.primaryColor)),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor.withOpacity(0.95),
        elevation: 0,
        leading: Center(
          child: Container(
            margin: const EdgeInsets.only(left: 16),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              // color: Colors.white10, // Optional hover effect style
            ),
            child: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
          ),
        ),
        centerTitle: true,
        title: Text("Edit Profile", style: AppTheme.heading3.copyWith(fontSize: 18)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel", style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Avatar Section
                    GestureDetector(
                      onTap: () {
                         // Pick Image logic
                      },
                      child: Column(
                        children: [
                          Stack(
                            children: [
                              Container(
                                width: 120, height: 120,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(color: const Color(0xFF1A3224), width: 4), // surface-dark border
                                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10)],
                                  image: const DecorationImage(
                                    image: AssetImage('assets/placeholder_user.png'), // Replace with user image
                                    fit: BoxFit.cover,
                                  )
                                ),
                              ),
                              Positioned(
                                bottom: 0, right: 0,
                                child: Container(
                                  width: 40, height: 40,
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: AppTheme.backgroundColor, width: 4),
                                  ),
                                  child: const Icon(Icons.photo_camera, size: 18, color: AppTheme.backgroundColor),
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Text("Change Photo", style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, fontSize: 14)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    
                    // Form Fields
                    _buildInputGroup(
                      label: "Full Name",
                      child: TextFormField(
                        controller: _nameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(placeholder: "e.g. John Doe").copyWith(
                           suffixIcon: const Icon(Icons.check_circle, color: AppTheme.primaryColor, size: 20),
                        ),
                      )
                    ),

                    const SizedBox(height: 24),

                    _buildInputGroup(
                      label: "Email Address",
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TextFormField(
                            controller: _emailController,
                            readOnly: true,
                            style: const TextStyle(color: Colors.grey),
                            decoration: _inputDecoration(fillColor: const Color(0xFF1A3224).withOpacity(0.5)).copyWith(
                               suffixIcon: const Icon(Icons.lock, color: Colors.grey, size: 20),
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Padding(
                            padding: EdgeInsets.only(left: 4),
                            child: Text("Contact admin to change email.", style: TextStyle(color: Colors.grey, fontSize: 12)),
                          )
                        ],
                      )
                    ),

                     const SizedBox(height: 24),

                    _buildInputGroup(
                      label: "Phone Number",
                      child: TextFormField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(placeholder: "+1 (555) 000-0000"),
                      )
                    ),
                    
                    const SizedBox(height: 24),

                    _buildInputGroup(
                      label: "Bio",
                      badge: _userRole.toUpperCase(),
                      child: TextFormField(
                        controller: _bioController,
                        maxLines: 4,
                        style: const TextStyle(color: Colors.white),
                        decoration: _inputDecoration(placeholder: "Tell us a bit about yourself..."),
                      )
                    ),
                    
                    const SizedBox(height: 100), // Space for bottom button
                  ],
                ),
              ),
            ),
          ),
          
          // Fixed Bottom Button
          Container(
             padding: const EdgeInsets.all(16),
             decoration: BoxDecoration(
               color: AppTheme.backgroundColor,
               border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
             ),
             child: SafeArea(
               child: SizedBox(
                 width: double.infinity,
                 height: 56,
                 child: ElevatedButton(
                   onPressed: () {
                      // Save Logic
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Profile Updated (Simulation)", style: TextStyle(color: Colors.black)), backgroundColor: AppTheme.primaryColor));
                   },
                   style: ElevatedButton.styleFrom(
                     backgroundColor: AppTheme.primaryColor,
                     foregroundColor: AppTheme.backgroundColor,
                     shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                     elevation: 8,
                     shadowColor: AppTheme.primaryColor.withOpacity(0.25),
                   ),
                   child: const Text("Save Changes", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                 ),
               ),
             ),
          )
        ],
      ),
    );
  }

  Widget _buildInputGroup({required String label, required Widget child, String? badge}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14, fontWeight: FontWeight.w500)),
              if (badge != null)
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                   decoration: BoxDecoration(
                     color: AppTheme.primaryColor.withOpacity(0.2),
                     borderRadius: BorderRadius.circular(10),
                     border: Border.all(color: AppTheme.primaryColor.withOpacity(0.3))
                   ),
                   child: Text(badge, style: const TextStyle(color: AppTheme.primaryColor, fontSize: 10, fontWeight: FontWeight.bold)),
                 )
            ],
          ),
        ),
        child
      ],
    );
  }

  InputDecoration _inputDecoration({String? placeholder, Color? fillColor}) {
    return InputDecoration(
      hintText: placeholder,
      hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
      filled: true,
      fillColor: fillColor ?? const Color(0xFF1A3224), // Dark Surface
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.white.withOpacity(0.1)), // Subtle border
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.primaryColor),
      ),
    );
  }
}
