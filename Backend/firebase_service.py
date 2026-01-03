def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            if not firebase_admin._apps:
                # 1. Local Development (File based)
                if os.path.exists('serviceAccountKey.json'):
                    cred = credentials.Certificate('serviceAccountKey.json')
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                    })
                    logger.info("Firebase initialized from local file")
                
                # 2. Render Deployment (Environment Variable based)
                elif os.getenv('FIREBASE_CREDENTIALS'):
                    # Load the JSON string from the environment variable
                    creds_dict = json.loads(os.getenv('FIREBASE_CREDENTIALS'))
                    cred = credentials.Certificate(creds_dict)
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                    })
                    logger.info("Firebase initialized from Environment Variable")
                    
                # 3. Fallback (Google Cloud Run / Auto-discovery)
                else:
                    firebase_admin.initialize_app()
                    logger.info("Firebase initialized from Default Credentials")
            
            self.db = firestore.client()
            self.bucket = storage.bucket()
            
        except Exception as e:
            logger.error(f"Firebase initialization error: {str(e)}")
            raise
