import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const en = {
  common: {
    welcome: "Welcome to Easter Cake Bake-Off",
    signIn: "Sign In",
    signOut: "Sign Out",
    createAccount: "Create Account",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    edit: "Edit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    sortNewestFirst: "Newest First",
    sortOldestFirst: "Oldest First",
    sortHighestRated: "Highest Rated"
  },
  process: {
    creating: "Creating...",
    loading: "Loading...",
    deleting: "Deleting...",
    updating: "Updating...",
    rating: "Rating...",
    uploading: "Uploading..."
  },
  auth: {
    signInRequired: "You must be signed in",
    signInMessage: "Please sign in or create an account to upload your cake.",
    deleteAccountTitle: "Delete Account",
    deleteAccountWarning: "Are you absolutely sure?",
    deleteAccountDescription: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including all your cakes and ratings.",
    accountDeleted: "Account deleted successfully.",
    displayNameUpdated: "Display name updated successfully!",
    email: "Email",
    password: "Password",
    signInWithEmail: "Sign In with Email",
    signInWithGoogle: "Sign in with Google",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    register: "Register",
    createAccountTitle: "Create Account",
    createAccountDesc: "Join our Easter cake community",
    displayName: "Display Name",
    yourName: "Your Name",
    chooseAvatar: "Choose Avatar Emoji",
    clickToChangeAvatar: "Click to change your avatar",
    createAccountButton: "Create Account",
    creatingAccount: "Creating Account...",
    hasAccount: "Already have an account?",
    signIn: "Sign In"
  },
  cakes: {
    share: "Share Your Cake",
    upload: "Upload Your Easter Cake",
    title: "Cake Title",
    description: "Cake Description",
    photos: "Cake Photos",
    titlePlaceholder: "My Delicious Easter Cake",
    descriptionPlaceholder: "Tell us about your cake! What makes it special?",
    uploadImages: "Upload Images",
    addMoreImages: "Add More Images",
    imagesCount: "{{count}} / {{max}} images",
    dragToReorder: "drag to reorder",
    createError: "Failed to create cake. Please try again.",
    createSuccess: "Cake created successfully!",
    deleteImage: "Delete Image",
    rateThis: "Rate this cake:",
    editCake: "Edit Cake",
    deleteCake: "Delete Cake",
    confirmDelete: "Delete Cake?",
    deleteWarning: "Are you sure you want to delete this cake? This action cannot be undone.",
    saveChanges: "Save Changes",
    anonymous: "Anonymous Baker",
    loading: "Loading cakes...",
    viewFullscreen: "View fullscreen",
    closeGallery: "Close gallery",
    ratingSingular: "rating",
    ratingPlural: "ratings",
    ratingPluralAlt: "ratings"
  },
  profile: {
    memberSince: "Member since",
    emojiAvatar: "Emoji avatar",
    changeAvatar: "Click to change your avatar",
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian",
    loading: "Loading profile...",
    welcome: "Welcome to Easter Cake Bake-Off",
    signInMessage: "Sign in to upload and rate Easter cakes",
    createAccount: "Create Account",
    uploadNewCake: "Upload New Cake",
    deleteAccount: "Delete Account",
    confirmDelete: "Are you absolutely sure?",
    deleteWarning: "This will permanently delete your account and remove all your data.",
    cancel: "Cancel",
    confirm: "Confirm",
    yourCakes: "Your Cake Creations",
    noCakes: "No cakes yet!",
    noCakesDesc: "You haven't uploaded any Easter cake creations yet.",
    uploadFirst: "Upload Your First Cake"
  },
  notFound: {
    title: "404",
    description: "Oops! Page not found",
    returnHome: "Return to Home"
  },
  layout: {
    appTitle: "Easter Cake Bake-Off",
    feed: "Feed",
    topRated: "Top Rated",
    addCake: "Add Cake",
    profile: "Profile"
  },
  errors: {
    validation: {
      cakes: {
        titleMin: "Title must be at least 3 characters long"
      }
    }
  }
};

const ua = {
  common: {
    welcome: "Вітаємо на змаганні з випікання пасок до Великодня!",
    signIn: "Увійти",
    signOut: "Вийти",
    createAccount: "Створити акаунт",
    delete: "Видалити",
    cancel: "Скасувати",
    save: "Зберегти",
    edit: "Редагувати",
    loading: "Завантаження...",
    error: "Помилка",
    success: "Успіх",
    sortNewestFirst: "Спочатку новіші",
    sortOldestFirst: "Спочатку старіші",
    sortHighestRated: "Спочатку найвище оцінені"
  },
  process: {
    creating: "Створюємо...",
    loading: "Завантажуємо...",
    deleting: "Видаляємо...",
    updating: "Оновлюємо...",
    rating: "Оцінюємо...",
    uploading: "Завантажуємо..."
  },
  auth: {
    signInRequired: "Ви повинні увійти в акаунт",
    signInMessage: "Будь ласка, увійдіть або створіть акаунт, щоб завантажити свої паски.",
    deleteAccountTitle: "Видалити акаунт",
    deleteAccountWarning: "Ви впевнені?",
    deleteAccountDescription: "Цю дію неможливо буде скасувати. Це видалить ваш акаунт і видалить всі ваші дані з нашого сервера, включно з вашими пасками та оцінками.",
    accountDeleted: "Акаунт видалено успішно.",
    displayNameUpdated: "Ім’я профілю успішно змінено!",
    email: "Електронна пошта",
    password: "Пароль",
    signInWithEmail: "Увійти з електронною поштою",
    signInWithGoogle: "Увійти через Google",
    orContinueWith: "Або продовжити з",
    noAccount: "Немає акаунту?",
    register: "Створити",
    createAccountTitle: "Створити акаунт",
    createAccountDesc: "Приєднуйтеся до нашого змагання з пасками",
    displayName: "Ім’я профілю",
    yourName: "Ваше ім’я",
    chooseAvatar: "Оберіть аватарку",
    clickToChangeAvatar: "Натисніть, щоб змінити ваш аватар",
    createAccountButton: "Створити акаунт",
    creatingAccount: "Створення акаунту...",
    hasAccount: "Вже маєте акаунт?",
    signIn: "Увійти"
  },
  cakes: {
    share: "Поділіться своєю паскою",
    upload: "Завантажте свою паску",
    title: "Назва паски",
    description: "Опис паски",
    photos: "Фото паски",
    titlePlaceholder: "Моя смачна паска",
    descriptionPlaceholder: "Розкажіть нам про свою паску! Що робить її особливою?",
    uploadImages: "Завантажити фото",
    addMoreImages: "Додати ще фото",
    imagesCount: "{{count}} / {{max}} фото",
    dragToReorder: "перетягніть для зміни порядку",
    createError: "Не вдалося створити паску. Будь ласка, спробуйте ще раз.",
    createSuccess: "Паска успішно створена!",
    deleteImage: "Видалити фото",
    rateThis: "Оцінити цю паску:",
    editCake: "Редагувати паску",
    deleteCake: "Видалити паску",
    confirmDelete: "Видалити паску?",
    deleteWarning: "Ви впевнені, що хочете видалити цю паску? Ця дія неможлива буде скасувати.",
    saveChanges: "Зберегти зміни",
    anonymous: "Анонімний пекар",
    loading: "Завантаження пасок...",
    viewFullscreen: "Переглянути на весь екран",
    closeGallery: "Закрити галерею",
    ratingSingular: "оцінка",
    ratingPlural: "оцінок",
    ratingPluralAlt: "оцінки"
  },
  profile: {
    memberSince: "З нами з",
    emojiAvatar: "Emoji аватар",
    changeAvatar: "Натисніть, щоб змінити ваш аватар",
    language: "Мова",
    english: "Англійська",
    ukrainian: "Українська",
    loading: "Завантаження профілю...",
    welcome: "Вітаємо на змаганні з випікання пасок до Великодня!",
    signInMessage: "Увійдіть, щоб завантажити та оцінити паски",
    createAccount: "Створити акаунт",
    uploadNewCake: "Завантажити нову паску",
    deleteAccount: "Видалити акаунт",
    confirmDelete: "Ви впевнені?",
    deleteWarning: "Це назавжди видалить ваш акаунт і всі ваші дані.",
    cancel: "Скасувати",
    confirm: "Підтвердити",
    yourCakes: "Ваші створені паски",
    noCakes: "Ще немає пасок!",
    noCakesDesc: "Ви ще не завантажили жодної паски.",
    uploadFirst: "Завантажте свою першу паску"
  },
  notFound: {
    title: "404",
    description: "Ой! Сторінку не знайдено",
    returnHome: "Повернутися на головну"
  },
  layout: {
    appTitle: "Змагання з випікання пасок",
    feed: "Лента",
    topRated: "Топ",
    addCake: "Додати паску",
    profile: "Профіль"
  },
  errors: {
    validation: {
      cakes: {
        titleMin: "Назва має бути не менше 3 символів"
      }
    }
  }
};

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: en },
      ua: { translation: ua },
    },
    fallbackLng: "en",
    detection: {
      order: ["navigator", "localStorage", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
