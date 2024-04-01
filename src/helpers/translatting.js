export default () => ({
  translateSignupError(error, defaultMessage = null) {
    switch (error.message) {
      case "Nom d'utilisateur déjà utilisé":
        return error.message
      case 'Firebase: Error (auth/email-already-in-use).':
        return 'Cette adresse email est déjà utilisée'
      case 'Firebase: Error (auth/invalid-email).':
        return 'Email invalide'
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateResetPasswordError(error, defaultMessage = null) {
    switch (error.message) {
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateSigninError(error, defaultMessage = null) {
    switch (error.message) {
      case 'Firebase: Error (auth/wrong-password).':
        return 'Identifiants incorrects'
      case 'Firebase: Error (auth/user-not-found).':
        return 'Identifiants incorrects'
      case 'Firebase: Error (auth/invalid-credential).':
        return 'Identifiants incorrects'
      case 'Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).':
        return 'Vous avez effectué trop de tentative, veuillez attendre un moment avant de réessayer'
      case 'Votre email n\'a pas encore été vérifiée':
        return error.message
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateLogoutError(error, defaultMessage = null) {
    switch (error.message) {
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateDeleteUserError(error, defaultMessage = null) {
    switch (error.message) {
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateUpdatePasswordError(error, defaultMessage = null) {
    switch (error.message) {
      case 'Firebase: Error (auth/wrong-password).':
        return 'Ancien mot de passe incorrect'
      case 'Firebase: Error (auth/invalid-credential).':
        return 'Ancien mot de passe incorrect'
      case 'FirebaseError: Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).':
        return 'Vous avez effectué trop de tentative, veuillez attendre un moment avant de réessayer'
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateUpdateUserError(error, defaultMessage = null) {
    switch (error.message) {
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateGetUserError(error, defaultMessage = null) {
    switch (error.message) {
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateUpdateUserEmailError(error, defaultMessage = null) {
    switch (error.message) {
      case 'Firebase: Error (auth/wrong-password).':
        return 'Mot de passe incorrect'
      case 'Firebase: Error (auth/user-not-found).':
        return 'Mot de passe incorrect'
      case 'Firebase: Error (auth/invalid-credential).':
        return 'Mot de passe incorrect'
      case 'Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).':
        return 'Vous avez effectué trop de tentative, veuillez attendre un moment avant de réessayer'
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateUpdateUsername(error, defaultMessage = null) {
    switch (error.message) {
      case "Nom d'utilisateur déjà utilisé":
        return error.message
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  },
  translateError(error, defaultMessage = null) {
    switch (error.message) {
      case 'All series must be of the same type':
        return 'Toutes les séries saisies doivent toutes être soit en type défaut, soit d\'un type autre que défaut'
      default:
        return defaultMessage || 'Une erreur est survenue'
    }
  }
})
