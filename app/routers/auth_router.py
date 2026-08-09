from typing import Any

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.schemas.auth_schema import (
    SignupRequest,
    PasswordLoginRequest,
    OTPLoginRequest,
    VerifyOTPRequest,
    UpdateProfileRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.services.auth_service import (
    get_profile,
    signup,
    login_with_password,
    login_with_otp,
    verify_otp_code,
    update_profile,
    forgot_password,
    reset_password,
    verify_otp_code,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/signup", response_model=AuthResponse, status_code=201,
            summary="Register a new user")
def signup_route(request: SignupRequest):

    token, user = signup(request)

    return AuthResponse(
        token=token,
        user=user,
    )


@router.post("/login/password", response_model=AuthResponse, status_code=200,
            summary="Login using password")
def login_password_route(request: PasswordLoginRequest):

    token, user = login_with_password(request)

    return AuthResponse(
        token=token,
        user=user,
    )


@router.post("/login/otp", response_model=MessageResponse, status_code=200, 
            summary="Send OTP")
def login_otp_route(request: OTPLoginRequest):

    return login_with_otp(request)

@router.post(
    "/verify-otp",
    status_code=200,
    summary="Verify OTP"
)
def verify_otp_route(
    request: VerifyOTPRequest
):

    return verify_otp_code(request)


@router.get("/profile", response_model=UserResponse, status_code=200,
            summary="Get current user profile")
def get_profile_route(current_user: dict[str, Any] = Depends(get_current_user)):

    return get_profile(user_id=current_user["user_id"])


@router.put("/profile", response_model=UserResponse, status_code=200, 
            summary="Update profile")
def update_profile_route(request: UpdateProfileRequest, 
                        current_user: dict[str, Any] = Depends(get_current_user)):

    return update_profile(user_id=current_user["user_id"], request=request)


@router.post("/forgot-password", response_model=MessageResponse, 
            status_code=200, summary="Send password reset OTP")
def forgot_password_route(request: ForgotPasswordRequest):

    return forgot_password(request)

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=200,
    summary="Reset password"
)
def reset_password_route(
    request: ResetPasswordRequest
):

    return reset_password(request)