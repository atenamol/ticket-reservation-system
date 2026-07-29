from enum import Enum
from typing import Literal
from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

# Enums

class UserRole(str, Enum):
    spectator = "spectator"
    admin = "admin"


class AccountStatus(str, Enum):
    active = "active"
    inactive = "inactive"

# Signup Request
# API: POST /signup

class SignupRequest(BaseModel):
    first_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User first name",
        examples=["Ali"]
    )

    last_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="User last name",
        examples=["Ahmadi"]
    )

    email: EmailStr | None = Field(
        default=None,
        description="User email address. Either email or phone number must be provided.",
        examples=["ali@gmail.com"]
    )

    phone: str | None = Field(
        default=None,
        pattern=r"^09\d{9}$",
        description="Iranian mobile phone number. Format: 09xxxxxxxxx",
        examples=["09123456789"]
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password. Must contain uppercase, lowercase letters and numbers.",
        examples=["Password123"]
    )

    city_id: int | None =  Field(
        default=None,
        description="Identifier of user's city.",
        examples=[1]
    )

    profile_picture: str | None = Field(
        default=None,
        max_length=255,
        description="URL or path of user's profile picture.",
        examples=["uploads/profile/user1.png"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "first_name": "Ali",
                "last_name": "Ahmadi",
                "email": "ali@gmail.com",
                "phone": "09123456789",
                "password": "Password123",
                "city_id": 1,
                "profile_picture": "uploads/profile/user1.png"
            }
        }
    )

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty.")

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):

        if not any(c.isupper() for c in value):
            raise ValueError("Password must contain at least one uppercase letter.")

        if not any(c.islower() for c in value):
            raise ValueError("Password must contain at least one lowercase letter.")

        if not any(c.isdigit() for c in value):
            raise ValueError("Password must contain at least one digit.")

        if " " in value:
            raise ValueError("Password cannot contain spaces.")

        return value

    @model_validator(mode="after")
    def validate_contact(self):

        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided.")

        return self

# Login Request with pass
# API: POST / login

class PasswordLoginRequest(BaseModel):
    email: EmailStr | None = Field(
        default=None,
        description="Email address used for login."
    )

    phone: str | None = Field(
        default=None,
        pattern=r"^09\d{9}$",
        description="Iranian mobile phone number."
    )

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password."
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "phone": "09123456789",
                "password": "Password123"
            }
        }
    )

    @model_validator(mode="after")
    def validate_contact(self):
        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided.")
        return self

    
# Login Request with otp
# API: POST /login

class OTPLoginRequest(BaseModel):
    email: EmailStr | None  = Field(
        default=None,
        description="User email used for authentication.",
        examples=["ali@gmail.com"]
    )

    phone: str | None = Field(
        default=None,
        pattern=r"^09\d{9}$",
        description="User mobile phone number.",
        examples=["09123456789"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "phone": "09123456789"
            }
        }
    )

    @model_validator(mode="after")
    def validate_contact(self):

        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided.")

        return self

# Verify OTP Request
# API: POST /verify-otp

class VerifyOTPRequest(BaseModel):
    email: EmailStr | None = Field(
        default=None,
        description="Email address where OTP was sent."
    )


    phone: str | None = Field(
        default=None,
        pattern=r"^09\d{9}$",
        description="Phone number where OTP was sent."
    )

    otp: str = Field(
        ...,
        pattern=r"^\d{6}$",
        description="One-time password received by user.",
        examples=["123456"]
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "phone": "09123456789",
                "otp": "123456"
            }
        }
    )

    @model_validator(mode="after")
    def validate_contact(self):

        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided.")

        return self



# Update Profile
# API: PUT /profile

class UpdateProfileRequest(BaseModel):
    first_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="New first name of user."
    )

    last_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
        description="New last name of user."
    )

    email: EmailStr | None = Field(
        default=None,
        description="New email address of the user.",
        examples=["newemail@gmail.com"]
    )

    phone: str | None = Field(
        default=None,
        pattern=r"^09\d{9}$",
        description="New Iranian mobile phone number. Format: 09xxxxxxxxx",
        examples=["09123456789"]
    )

    city_id: int | None = Field(
        default=None,
        description="New city identifier."
    )

    profile_picture: str | None = Field(
        default=None,
        max_length=255,
        description="New profile picture path or URL."
    )


    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value):

        if value is None:
            return value


        value = value.strip()

        if not value:
            raise ValueError("Name cannot be empty.")

        return value

# Token Response

class TokenResponse(BaseModel):
    access_token: str = Field(
        ...,
        description="JWT access token used for authenticated requests."
    )

    token_type: Literal["bearer"] = Field(
        default="bearer",
        description="Authentication scheme type."
    )

# Message Response

class MessageResponse(BaseModel):
    success: bool = True
    message: str = Field(
        ...,
        description="Operation result message.",
        examples=["OTP sent successfully."]
    )

# User Response

class UserResponse(BaseModel):
    user_id: int = Field(
        description="Unique identifier of user."
    )

    first_name: str = Field(
        description="User first name."
    )

    last_name: str = Field(
        description="User last name."
    )

    email: EmailStr | None = Field(
        description="User email address."
    )

    phone: str | None = Field(
        description="User phone number."
    )

    role: UserRole = Field(
        description="User role in system."
    )

    city_id: int | None = Field(
        description="User city identifier."
    )

    account_status: AccountStatus = Field(
        description="Current account status."
    )

    profile_picture: str | None = Field(
        description="Profile picture URL or path."
    )

    registered_at: datetime = Field(
    description="Registration date and time."
)

    model_config = ConfigDict(
        from_attributes=True
    )


# Database User Model

class UserInDB(BaseModel):
    user_id: int

    first_name: str
    last_name: str

    email: EmailStr | None
    phone: str | None

    password_hash: str = Field(
        description="Encrypted password hash stored in database."
    )

    role: UserRole

    city_id: int | None

    account_status: AccountStatus

    registered_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    token: TokenResponse
    user: UserResponse