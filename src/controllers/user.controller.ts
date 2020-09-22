import {inject} from '@loopback/core';
import {
  repository
} from '@loopback/repository';
import {
  get, param,
  patch, post,
  requestBody,
  Response,
  RestBindings
} from '@loopback/rest';
import * as bcrypt from 'bcrypt';
import * as jsonwebtoken from 'jsonwebtoken';
import {UserAccountRepository, UserRepository} from '../repositories';
import {generateNewOTP} from './../utils/utils';
const uuidv4 = require('uuid-v4');
const expiresIn = '1d';
const config = require('../config/config').config;

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @repository(UserAccountRepository) public userAccountRepository: UserAccountRepository,

  ) {}

  @post('/users/sign-up')
  async signUp(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {

      if (body.accountType == "CUSTOM") {
        if (!body.password) {
          return response.status(400).json({message: "Password is required"});
        }
        if (body.password.length < 8 || body.password.length > 25) {
          return response.status(400).json({message: "Password length should be in between 8 & 25"});
        }
      } else {
        if (!body.socialLoginId) {
          return response.status(400).json({message: "SocialLoginId is required"});
        }

        //check for categories is entered or not
        if (!body.categories) {
          return response.status(400).json({message: "SocialLoginId is required"});
        }

        if (body.isEmailVerificationRequired !== true && body.isEmailVerificationRequired !== false) {
          return response.status(400).json({message: "Email verification is required"});
        }

        const checkUserAccount = await this.userAccountRepository.findOne({where: {loginId: body.socialLoginId.trim().toLowerCase()}});

        if (checkUserAccount) {
          return response.status(400).json({message: "LoginId Already exist"});
        }
      }

      const user = await this.userRepository.findOne({where: {email: body.email.trim().toLowerCase()}});

      if (user) {
        return response.status(403).json({message: "Email Already exist"});
      } else {
        var obj = {
          id: uuidv4(),
          username: body.username.trim().toLowerCase(),
          email: body.email.trim().toLowerCase(),
          gender: body.gender.trim().toUpperCase(),
          relationshipStatus: body.relationshipStatus.trim().toUpperCase(),
          zipcode: body.zipcode,
          country: body.country.trim().toUpperCase(),
          categories: body.categories,
          isActive: true,
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        let savedUser = await this.userRepository.create(obj);

        let userAccount: any = {
          id: uuidv4(),
          userId: savedUser.id,
          password: await bcrypt.hash(body.password, 10),
          accountType: body.accountType,
          loginId: body.email.trim().toLowerCase(),
          accountVerified: false,
          otp: await generateNewOTP(),
          otpExpiry: (15 * 60 * 1000) + Date.now(),
          categories: body.categories,
          isActive: true,
          isDeleted: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        if (body.accountType !== "CUSTOM") {
          userAccount.loginId = body.socialLoginId ? body.socialLoginId : body.email.trim().toLowerCase();
          userAccount.password = "";
          if (!body.isEmailVerificationRequired) {
            userAccount.accountVerified = true;
          }
        }

        let savedUserAccount = await this.userAccountRepository.create(userAccount);

        // OTP Account Verification check
        if (!savedUserAccount.accountVerified) {
          return response.status(200).json({message: "Otp has sent on your mail id. Please check", data: {otp: userAccount.otp}});
        } else {
          if (savedUserAccount.accountType !== "CUSTOM") {
            const token = jsonwebtoken.sign({id: savedUser.id, username: savedUser.username}, config.CRYPTO_KEY, {
              expiresIn,
            });
            return response.status(200).json({message: "Login", data: {token: token}});

          } else {
            return response.status(200).json({message: "Otp has sent on your mail id. Please check", data: {otp: userAccount.otp}})
          }
        }
      }
    } catch (err) {
      return response.status(500).json({message: err.message});
    }
  }

  @post('/users/verify-otp')
  async verifyOtp(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {
      if (!body.email) {
        return response.status(400).json({message: "Email is required"})
      }
      if (!body.otp) {
        return response.status(400).json({message: "Otp is required"})
      }
      if (!body.accountType) {
        return response.status(400).json({message: "Account type is required"})
      }
      let user = await this.userRepository.findOne({where: {email: body.email.trim().toLowerCase()}})
      if (user) {
        if (user.isActive) {
          const userAccount = await this.userAccountRepository.findOne({where: {loginId: user.email.trim().toLowerCase(), accountType: body.accountType}});
          if (userAccount) {
            if (userAccount.isActive) {
              if (userAccount.accountVerified !== true) {
                if (body.otp === userAccount.otp) {
                  let updateObj = {accountVerified: true, otp: "", otpExpiry: 0};
                  await this.userAccountRepository.updateById(userAccount.id, updateObj);
                  const token = jsonwebtoken.sign({id: user.id, username: user.username}, config.CRYPTO_KEY, {
                    expiresIn,
                  });
                  return response.status(200).json({message: "Login", data: {token: token}});
                } else {
                  return response.status(404).json({message: "OTP do not match!"});
                }
              } else {
                return response.status(403).json({message: "Your Account already Verified"});
              }
            } else {
              return response.status(404).json({message: "Account is not active. please contact to admin"});
            }
          } else {
            return response.status(400).json({message: "Invalid credentials"});
          }
        } else {
          return response.status(404).json({message: "Account is not active. please contact to admin"});
        }
      } else {
        return response.status(400).json({message: "Invalid credentials"});
      }
    } catch (err) {
      return response.status(500).json({message: err.message});
    }
  }

  @post('/users/sign-in')
  async signIn(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {
      if (!body.loginId) {
        return response.status(400).json({message: "Login Id is required"})
      }
      if (!body.password) {
        return response.status(400).json({message: "Password is required"})
      }
      const userAccount = await this.userAccountRepository.findOne({where: {loginId: body.loginId.trim().toLowerCase()}});
      if (userAccount) {
        if (userAccount.isActive) {
          if (userAccount.accountVerified) {
            const user = await this.userRepository.findById(userAccount.userId);
            if (user) {
              if (user.isActive) {
                const token = jsonwebtoken.sign({id: user.id, username: user.username}, config.CRYPTO_KEY, {
                  expiresIn,
                });
                return response.status(200).json({message: "Login", data: {token: token}})
              } else {
                return response.status(404).json({message: "Account is not active. please contact to admin"})
              }
            } else {
              return response.status(400).json({message: "Invalid credentials"})
            }
          } else {
            if (userAccount.password) {
              const passwordMatched = await bcrypt.compare(body.password, userAccount.password);
              if (!passwordMatched) {
                return response.status(400).json({message: "Invalid credentials"})
              }
              return response.status(400).json({message: "Account not verified, OTP has been sent on registered email id or mobile number, please verify it"})
            } else {
              return response.status(400).json({message: "Invalid credentials"})
            }
          }
        } else {
          return response.status(403).json({message: "Account is not active. please contact to admin"})
        }
      } else {
        return response.status(400).json({message: "Invalid credentials"})
      }
    } catch (err) {
      return response.status(500).json({message: err.message})
    }
  }

  @post('/users/social-sign-in')
  async socialSignIn(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {
      if (!body.loginId) {
        return response.status(400).json({message: "Login Id is required"})
      }
      if (!body.accountType) {
        return response.status(400).json({message: "Account type is required"})
      }

      if (body.accountType == "CUSTOM") {
        return response.status(400).json({message: "Invalid account type"})
      }
      const userAccount = await this.userAccountRepository.findOne({where: {loginId: body.loginId.toLowerCase(), accountType: body.accountType}});

      if (userAccount) {
        if (userAccount.isActive) {
          if (userAccount.accountVerified) {
            let user = await this.userRepository.findById(userAccount.userId);
            if (user) {
              if (user.isActive) {
                const token = jsonwebtoken.sign({id: user.id, username: user.username}, config.CRYPTO_KEY, {
                  expiresIn,
                });
                return response.status(200).json({message: "Login", data: {token: token}});
              } else {
                return response.status(404).json({message: "Account is not active. please contact to admin"});
              }
            } else {
              return response.status(400).json({message: "Invalid credentials"});
            }
          } else {
            return response.status(403).json({message: "Account is not Verified"});
          }
        } else {
          return response.status(403).json({message: "Account is not active. please contact to admin"});
        }
      } else {
        return response.status(400).json({message: "Invalid credentials"});
      }
    } catch (err) {
      return response.status(500).json({message: err.message});
    }
  }

  @get('/users/profile')
  async getProfile(@param.query.string('id') id: string,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {
      if (!id) {
        return response.status(400).json({message: "User id is required"})
      }
      let user = await this.userRepository.findById(id, {fields: {id: true, username: true, email: true, gender: true, relationshipStatus: true, zipcode: true, country: true}});
      if (user) {
        let userAccount: any = await this.userAccountRepository.find({where: {userId: id, accountVerified: true}});
        if (userAccount && userAccount.length) {
          return response.status(200).json({message: "User profile", data: {user: user}})
        } else {
          return response.status(403).json({message: "User account not verified"})
        }
      } else {
        return response.status(404).json({message: "User not found"})
      }
    } catch (err) {
      return response.status(500).json({message: err.message});
    }
  }
  @patch('/users/profile')
  async updateUserProfile(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {
      if (!body.id) {
        return response.status(400).json({message: "User id is required"})

      }
      let user = await this.userRepository.findById(body.id);
      if (user) {
        let userObj: any = {
          updatedAt: Date.now()
        }
        if (body.gender) {
          userObj.gender = body.gender.trim().toUpperCase();
        }

        if (body.username) {
          let user_availability: any = await this.userRepository.find({where: {username: body.username.trim().toLowerCase(), id: {neq: user.id}}});
          if (user_availability && user_availability.length) {
            return response.status(400).json({message: "User name already taken"})
          }
          userObj.username = body.username.trim().toLowerCase();
        }

        if (body.country) {
          userObj.country = body.country.trim().toUpperCase();
        }

        if (body.zipcode) {
          userObj.zipcode = body.zipcode;
        }

        //categories
        if (body.categories) {
          userObj.categories = body.categories;
        }

        if (body.relationshipStatus) {
          userObj.relationshipStatus = body.relationshipStatus.trim().toUpperCase();
        }

        await this.userRepository.updateById(user.id, userObj);
        return response.status(200).json({message: "User profile updated"});
      } else {
        return response.status(404).json({message: "User not found"});
      }
    } catch (err) {
      console.log(err, "This is the errr");
      return response.status(500).json({message: err.message});
    }
  }
}
