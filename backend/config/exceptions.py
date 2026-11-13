from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_data = {
            "error": True,
            "status_code": response.status_code,
            "details": response.data,
        }
        if isinstance(response.data, dict) and "detail" in response.data:
            custom_data["message"] = str(response.data["detail"])
        elif isinstance(response.data, dict):
            first_key = next(iter(response.data), None)
            if first_key:
                val = response.data[first_key]
                msg = val[0] if isinstance(val, list) and val else str(val)
                custom_data["message"] = f"{first_key}: {msg}"
            else:
                custom_data["message"] = "Validation error."
        else:
            custom_data["message"] = "Request could not be processed."
        response.data = custom_data
    return response
