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
  },
  auth: {
    signInRequired: "You must be signed in",
    signInMessage: "Please sign in or create an account to upload your cake.",
    deleteAccountTitle: "Delete Account",
    deleteAccountWarning: "Are you absolutely sure?",
    deleteAccountDescription: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including all your cakes and ratings.",
    accountDeleted: "Account deleted successfully.",
    displayNameUpdated: "Display name updated successfully!",
  },
  cakes: {
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
  },
  profile: {
    memberSince: "Member since {{date}}",
    changeAvatar: "Click to change your avatar",
    language: "Language",
    english: "English",
    ukrainian: "Ukrainian",
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
  }
};

const ua = {
  common: {},
  auth: {},
  cakes: {},
  profile: {},
  notFound: {},
  layout: {}
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
