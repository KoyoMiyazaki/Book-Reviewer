package entity

type RegisterRequest struct {
	Name                 string `json:"name" validate:"required"`
	Email                string `json:"email" validate:"required"`
	Password             string `json:"password" validate:"required"`
	PasswordConfirmation string `json:"passwordConfirmation" validate:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Status string `json:"status"`
	Error  string `json:"error"`
	Data   any    `json:"data"`
}

type ResponseUser struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Token string `json:"token"`
}
