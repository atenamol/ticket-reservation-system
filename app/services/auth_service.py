from fastapi import HTTPException, status

from app.queries.auth_queries import (
    create_user,
    get_user_by_contact,
    get_user_by_email,
    get_user_by_phone,
    get_user_by_id,
    update_user_profile,
)
from app.schemas.auth_schema import (
    SignupRequest,
    TokenResponse,
    UserResponse,
    PasswordLoginRequest,
    OTPLoginRequest,
    MessageResponse,
    VerifyOTPRequest,
    UpdateProfileRequest,
)

from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from app.utils.otp import (
    generate_otp,
    save_otp,
    verify_otp,
    send_otp,
)

# signup


def signup(user: SignupRequest) -> tuple[TokenResponse, UserResponse]:

    existing_user = get_user_by_contact(email=user.email, phone=user.phone)

    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="User with this email or phone already exists.")

    password_hash = hash_password(user.password)

    user_id = create_user(user=user, password_hash=password_hash)

    created_user = get_user_by_id(user_id)

    if created_user is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                            detail="User creation failed.")

    access_token = create_access_token(
        {
            "sub": created_user["email"] or created_user["phone"],
            "user_id": created_user["user_id"],
            "role": created_user["role"],
        }
    )

    return (TokenResponse(access_token=access_token),
            UserResponse.model_validate(created_user))


# login with pass

def login_with_password(request: PasswordLoginRequest) -> tuple[TokenResponse, UserResponse]:

    user = get_user_by_contact(email=request.email, phone=request.phone)

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="User not found.")

    if user["account_status"] != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Your account is inactive.")

    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Invalid password.",)

    access_token = create_access_token(
        {
            "sub": user["email"] or user["phone"],
            "user_id": user["user_id"],
            "role": user["role"],
        }
    )

    return (TokenResponse(access_token=access_token),
            UserResponse.model_validate(user))

# login with otp

def login_with_otp(request: OTPLoginRequest) -> MessageResponse:

    user = get_user_by_contact(email=request.email, phone=request.phone)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found.")

    if user["account_status"] != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Your account is inactive.")

    contact = request.email or request.phone

    otp = generate_otp()

    save_otp(contact=contact, otp=otp)

    send_otp(destination=contact, otp=otp)

    # Send OTP via SMS or Email

    return MessageResponse(message=f"OTP sent successfully. Code: {otp}")

# verify otp

def verify_login_otp(request: VerifyOTPRequest) -> tuple[TokenResponse, UserResponse]:

    user = get_user_by_contact(email=request.email, phone=request.phone)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found.")

    if user["account_status"] != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Your account is inactive.")

    contact = request.email or request.phone

    if not verify_otp(contact, request.otp):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired OTP.")

    access_token = create_access_token(
        {
            "sub": user["email"] or user["phone"],
            "user_id": user["user_id"],
            "role": user["role"],
        }
    )

    return (TokenResponse(access_token=access_token),
            UserResponse.model_validate(user))


def update_profile(user_id: int, request: UpdateProfileRequest) -> UserResponse:

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="User not found.")

    if request.email is not None:
        existing_user = get_user_by_email(request.email)

        if (existing_user is not None
            and existing_user["user_id"] != user_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Email already exists.")

    if request.phone is not None:
        existing_user = get_user_by_phone(request.phone)

        if (existing_user is not None
            and existing_user["user_id"] != user_id):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                                detail="Phone number already exists.")

    updated = update_user_profile(
        user_id=user_id,
        first_name=request.first_name,
        last_name=request.last_name,
        email=request.email,
        phone=request.phone,
        city_id=request.city_id,
        profile_picture=request.profile_picture,
    )

    if not updated:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Profile update failed.")

    updated_user = get_user_by_id(user_id)

    return UserResponse.model_validate(updated_user)