import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:email_validator/email_validator.dart';
import 'package:artefacto/common/page_header.dart';
import 'package:artefacto/common/page_heading.dart';
import 'package:artefacto/common/custom_input_field.dart';
import 'package:artefacto/common/custom_form_button.dart';
import 'package:artefacto/model/user_model.dart';
import 'package:artefacto/service/user_service.dart';

class EditProfilePage extends StatefulWidget {
  final User user;

  const EditProfilePage({Key? key, required this.user}) : super(key: key);

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _editFormKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _newPasswordController;
  late TextEditingController _confirmPasswordController;

  File? _newProfileImage;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.username);
    _emailController = TextEditingController(text: widget.user.email);
    _newPasswordController = TextEditingController();
    _confirmPasswordController = TextEditingController();
  }

  Future _pickProfileImage() async {
    final pickedImage = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedImage != null) {
      setState(() {
        _newProfileImage = File(pickedImage.path);
      });
    }
  }

  void _handleUpdateProfile() async {
    if (_editFormKey.currentState!.validate()) {
      if (_newPasswordController.text.isNotEmpty &&
          _confirmPasswordController.text != _newPasswordController.text) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password baru dan konfirmasi tidak cocok')),
        );
        return;
      }

      final updatedUser = User(
        id: widget.user.id,
        username: _nameController.text,
        email: _emailController.text,
        newPassword: _newPasswordController.text.isNotEmpty
            ? _newPasswordController.text
            : null,
        confirmNewPassword: _confirmPasswordController.text.isNotEmpty
            ? _confirmPasswordController.text
            : null,
      );

      try {
        final result = await UserApi.updateUserWithImage(updatedUser, _newProfileImage);
        if (result['status'] == 'sukses') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Profil berhasil diperbarui!')),
          );
          Navigator.pop(context, updatedUser);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['message'] ?? 'Gagal memperbarui profil')),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        backgroundColor: const Color(0xffFFFFFF),
        body: SingleChildScrollView(
          child: Form(
            key: _editFormKey,
            child: Column(
              children: [
                const PageHeader(),
                Container(
                  decoration: const BoxDecoration(
                    color: Color(0xffF5F0DF),
                    borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Column(
                    children: [
                      const PageHeading(title: 'Edit Profile'),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: 130,
                        height: 130,
                        child: CircleAvatar(
                          backgroundColor: Colors.white,
                          backgroundImage: _newProfileImage != null
                              ? FileImage(_newProfileImage!)
                              : (widget.user.profilePicture != null
                              ? NetworkImage(widget.user.profilePicture!) as ImageProvider
                              : null),
                          child: Stack(
                            children: [
                              Positioned(
                                bottom: 5,
                                right: 5,
                                child: GestureDetector(
                                  onTap: _pickProfileImage,
                                  child: Container(
                                    height: 50,
                                    width: 50,
                                    decoration: BoxDecoration(
                                      color: Colors.brown,
                                      border: Border.all(color: Colors.black, width: 3),
                                      borderRadius: BorderRadius.circular(25),
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      color: Colors.white,
                                      size: 25,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      CustomInputField(
                        controller: _nameController,
                        labelText: 'Username',
                        hintText: 'Edit your username',
                        isDense: true,
                        validator: (value) =>
                        value == null || value.isEmpty ? 'Username is required!' : null,
                      ),
                      const SizedBox(height: 16),
                      CustomInputField(
                        controller: _emailController,
                        labelText: 'Email',
                        hintText: 'Edit your email',
                        isDense: true,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Email is required!';
                          }
                          if (!EmailValidator.validate(value)) {
                            return 'Please enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CustomInputField(
                        controller: _newPasswordController,
                        labelText: 'New Password',
                        hintText: 'Enter your new password',
                        isDense: true,
                        obscureText: true,
                        validator: (value) {
                          if (value != null && value.isNotEmpty && value.length < 6) {
                            return 'Password must be at least 6 characters';
                          }
                          return null;
                        },
                        suffixIcon: true,
                      ),
                      const SizedBox(height: 16),
                      CustomInputField(
                        controller: _confirmPasswordController,
                        labelText: 'Confirm Password',
                        hintText: 'Re-enter your new password',
                        isDense: true,
                        obscureText: true,
                        validator: (value) {
                          if (_newPasswordController.text.isNotEmpty) {
                            if (value == null || value.isEmpty) return 'Confirmation required!';
                            if (value != _newPasswordController.text) return 'Passwords do not match!';
                          }
                          return null;
                        },
                        suffixIcon: true,
                      ),
                      const SizedBox(height: 8),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24.0),
                        child: Text(
                          'Kosongkan password baru jika tidak ingin mengubah password.',
                          style: TextStyle(color: Colors.grey, fontSize: 12),
                        ),
                      ),
                      const SizedBox(height: 22),
                      CustomFormButton(innerText: 'Update Profile', onPressed: _handleUpdateProfile),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Tidak jadi update',
                          style: TextStyle(color: Colors.brown),
                        ),
                      ),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
