import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load the environment variables from your .env file for local development
load_dotenv(os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
# It will pull from DigitalOcean environment variables, or use the default locally
SECRET_KEY = os.environ.get(
    'SECRET_KEY', 
    'django-insecure-@ab!y!t(nc8s1yolt)4lepsuxl_%neaw3_m)s2e_ur(nvcc*^w'
)

# SECURITY WARNING: don't run with debug turned on in production!
# Set to False by default for production safety. 
# Add an Env Var `DEBUG=True` in DigitalOcean only if actively troubleshooting.
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allow specific hosts
ALLOWED_HOSTS = ['*']
CORS_ORIGIN_ALLOW_ALL = True
CSRF_TRUSTED_ORIGINS = ["https://university-project-xi-weld.vercel.app"]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'accounts',
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', # MUST be above Session and Common middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Tell DRF to use Token Authentication by default
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# --- CORS & CSRF Settings ---

# Allow cookies to be sent cross-origin
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://university-project-xi-weld.vercel.app", 
    "http://localhost:3000",
    "http://192.168.0.104:3000",
]

# Trust the frontend for CSRF tokens
CSRF_TRUSTED_ORIGINS = [
    "https://university-project-xi-weld.vercel.app", 
    "https://shark-app-jifss.ondigitalocean.app",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Optional but helpful for local development with sessions:
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

ROOT_URLCONF = 'BACKEND.urls'
AUTH_USER_MODEL = 'accounts.CustomUser'

LOGIN_REDIRECT_URL = 'dashboard'
LOGOUT_REDIRECT_URL = 'login'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'BACKEND.wsgi.application'

# --- Database Settings ---
# Requires MONGO_URI to be set in DigitalOcean Environment Variables
DATABASES = {
    'default': {
        'ENGINE': 'django_mongodb_backend',
        'NAME': 'Final-testing',
        'CLIENT': {
            'host': os.environ.get('MONGO_URI')
        }
    }
}


DEFAULT_AUTO_FIELD = 'django_mongodb_backend.fields.ObjectIdAutoField'
SILENCED_SYSTEM_CHECKS = ["mongodb.E001"]

# DATABASES = {
#     'default': {
#         'ENGINE': 'django_mongodb_backend',
#         'NAME': 'Final-testing',
#         'CLIENT': {
#             'host': 'mongodb+srv://doadmin:q4Y5a673F1rWD9B0@University-998e6519.mongo.ondigitalocean.com/Final-testing?authSource=admin&tls=true',
#         },
#     }
# }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# --- Static Files Configuration ---
# Required for serving admin panel CSS/JS in production
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')