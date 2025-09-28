export function prettifyPBError(err) {
  const messages = [];

  if (err?.data && Object.keys(err.data).length > 0) {
    for (const field in err.data) {
      const fieldError = err.data[field];

      if (fieldError?.message) {
        // Prettify the message based on the error code and message
        let userMessage = fieldError.message;
        if (userMessage) {
          messages.push(field + ": " + userMessage);
        }
      }
    }
  }

  if (messages.length === 0) {
    return err?.message || "";
  }

  return messages.join("\n");
}
/*
    data: {
    email: {
      code: 'validation_invalid_email',
      message: 'The email is invalid or already in use.'
    }
    name: { 
      code: 'missing', 
      message: 'Missing name value' 
    },
    passwordConfirm: {
      code: 'validation_values_mismatch',
      message: "Values don't match."
    }
  }
 */
