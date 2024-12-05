class ServerException(Exception):

	def __init__(self, message="Something went wrong", code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "SERVER_ERROR"


class WrongMethodException(Exception):

	def __init__(self, message="Wrong method", code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "WRONG_METHOD"


class AlreadyExistException(Exception):

	def __init__(self, message: str, code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "ALREADY_EXIST_ERROR"


class ValidationException(Exception):

	def __init__(self, message: str, code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "VALIDATION_ERROR"


class NotAuthorizedException(Exception):

	def __init__(self, message: str, code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "NOT_AUTHORIZED_ERROR"


class DoesNotExistException(Exception):

	def __init__(self, message: str, code="UNKNOWN"):
		self.message = message
		self.code = code
		self.error_name = "DOES_NOT_EXIST_ERROR"