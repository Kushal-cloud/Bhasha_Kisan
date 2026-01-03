"""
services/firebase_service.py
Firebase Admin SDK Integration for Firestore and Authentication
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
import logging
import os
import json

logger = logging.getLogger(__name__)

class FirebaseService:
    """
    Unified Firebase service for Bhasha-Kisan
    Handles authentication, Firestore operations, and Cloud Storage
    """
    
    def __init__(self):
        self.db = None
        self.bucket = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Initialize with service account or default credentials
            if not firebase_admin._apps:
                # For local development
                if os.path.exists('serviceAccountKey.json'):
                    cred = credentials.Certificate('serviceAccountKey.json')
                    firebase_admin.initialize_app(cred, {
                        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
                    })
                else:
                    # For Cloud Run with Application Default Credentials
                    firebase_admin.initialize_app()
            
            self.db = firestore.client()
            self.bucket = storage.bucket()
            logger.info("Firebase initialized successfully")
            
        except Exception as e:
            logger.error(f"Firebase initialization error: {str(e)}")
            raise
    
    # ============= User Management =============
    
    async def create_user_profile(self, user_id: str, profile_data: Dict) -> Dict:
        """Create initial user profile in Firestore"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            
            profile = {
                'user_id': user_id,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'preferred_language': profile_data.get('language', 'hi-IN'),
                'location': profile_data.get('location', {}),
                'crops': profile_data.get('crops', []),
                'farm_size_acres': profile_data.get('farm_size', 0),
                'queries_count': 0,
                'last_active': firestore.SERVER_TIMESTAMP
            }
            
            user_ref.set(profile, merge=True)
            logger.info(f"User profile created: {user_id}")
            
            return profile
            
        except Exception as e:
            logger.error(f"User profile creation error: {str(e)}")
            raise
    
    async def get_user_profile(self, user_id: str) -> Dict:
        """Retrieve user profile from Firestore"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            doc = user_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            else:
                # Create default profile
                return await self.create_user_profile(user_id, {})
                
        except Exception as e:
            logger.error(f"User profile retrieval error: {str(e)}")
            return {}
    
    async def update_user_profile(self, user_id: str, updates: Dict) -> bool:
        """Update user profile"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            updates['updated_at'] = firestore.SERVER_TIMESTAMP
            updates['last_active'] = firestore.SERVER_TIMESTAMP
            
            user_ref.update(updates)
            logger.info(f"User profile updated: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"User profile update error: {str(e)}")
            return False
    
    # ============= Voice Query Storage =============
    
    async def store_voice_query(
        self,
        user_id: str,
        transcript: str,
        language: str,
        confidence: float,
        session_id: Optional[str] = None
    ) -> str:
        """Store voice transcription in Firestore"""
        try:
            query_ref = self.db.collection('voice_queries').document()
            
            query_data = {
                'query_id': query_ref.id,
                'user_id': user_id,
                'transcript': transcript,
                'language': language,
                'confidence': confidence,
                'session_id': session_id,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'type': 'voice'
            }
            
            query_ref.set(query_data)
            
            # Update user's query count
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({
                'queries_count': firestore.Increment(1),
                'last_active': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Voice query stored: {query_ref.id}")
            return query_ref.id
            
        except Exception as e:
            logger.error(f"Voice query storage error: {str(e)}")
            raise
    
    # ============= Crop Analysis Storage =============
    
    async def store_crop_analysis(
        self,
        user_id: str,
        analysis: Dict,
        image_url: Optional[str],
        audio_url: Optional[str]
    ) -> str:
        """Store crop disease analysis in Firestore"""
        try:
            analysis_ref = self.db.collection('crop_analyses').document()
            
            analysis_data = {
                'analysis_id': analysis_ref.id,
                'user_id': user_id,
                'crop_type': analysis.get('crop_type'),
                'disease_name': analysis.get('disease_name'),
                'disease_scientific': analysis.get('disease_name_scientific'),
                'severity': analysis.get('severity'),
                'confidence': analysis.get('confidence', 0.0),
                'treatment_plan': analysis.get('treatment_steps', []),
                'prevention_tips': analysis.get('prevention_tips', []),
                'image_url': image_url,
                'audio_response_url': audio_url,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'type': 'image',
                'full_analysis': analysis
            }
            
            analysis_ref.set(analysis_data)
            
            # Update user statistics
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({
                'queries_count': firestore.Increment(1),
                'last_active': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Crop analysis stored: {analysis_ref.id}")
            return analysis_ref.id
            
        except Exception as e:
            logger.error(f"Crop analysis storage error: {str(e)}")
            raise
    
    # ============= Complete Interaction Storage =============
    
    async def store_complete_interaction(
        self,
        user_id: str,
        query_type: str,
        input_data: Dict,
        ai_response: Dict,
        audio_response_url: Optional[str] = None
    ) -> str:
        """Store complete user interaction"""
        try:
            interaction_ref = self.db.collection('interactions').document()
            
            interaction_data = {
                'interaction_id': interaction_ref.id,
                'user_id': user_id,
                'query_type': query_type,
                'input': input_data,
                'ai_response': ai_response,
                'audio_response_url': audio_response_url,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'satisfaction_rating': None,  # Can be updated later
                'feedback': None
            }
            
            interaction_ref.set(interaction_data)
            logger.info(f"Complete interaction stored: {interaction_ref.id}")
            
            return interaction_ref.id
            
        except Exception as e:
            logger.error(f"Interaction storage error: {str(e)}")
            raise
    
    # ============= History Retrieval =============
    
    async def get_user_history(
        self,
        user_id: str,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict]:
        """Retrieve user's query history"""
        try:
            # Query voice queries
            voice_queries = (
                self.db.collection('voice_queries')
                .where('user_id', '==', user_id)
                .order_by('timestamp', direction=firestore.Query.DESCENDING)
                .limit(limit)
                .offset(offset)
                .stream()
            )
            
            # Query crop analyses
            crop_analyses = (
                self.db.collection('crop_analyses')
                .where('user_id', '==', user_id)
                .order_by('timestamp', direction=firestore.Query.DESCENDING)
                .limit(limit)
                .offset(offset)
                .stream()
            )
            
            history = []
            
            # Process voice queries
            for doc in voice_queries:
                data = doc.to_dict()
                history.append({
                    'id': doc.id,
                    'type': 'voice',
                    'timestamp': data['timestamp'].isoformat() if data.get('timestamp') else None,
                    'summary': data.get('transcript', '')[:100],
                    'data': data
                })
            
            # Process crop analyses
            for doc in crop_analyses:
                data = doc.to_dict()
                history.append({
                    'id': doc.id,
                    'type': 'image',
                    'timestamp': data['timestamp'].isoformat() if data.get('timestamp') else None,
                    'summary': f"{data.get('crop_type', 'Unknown')} - {data.get('disease_name', 'Analysis')}",
                    'data': data
                })
            
            # Sort combined history by timestamp
            history.sort(key=lambda x: x['timestamp'] or '', reverse=True)
            
            return history[:limit]
            
        except Exception as e:
            logger.error(f"History retrieval error: {str(e)}")
            return []
    
    async def get_interaction_by_id(self, interaction_id: str) -> Optional[Dict]:
        """Get specific interaction details"""
        try:
            doc = self.db.collection('interactions').document(interaction_id).get()
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Interaction retrieval error: {str(e)}")
            return None
    
    # ============= Analytics & Statistics =============
    
    async def get_user_statistics(self, user_id: str) -> Dict:
        """Get user analytics and statistics"""
        try:
            # Get user profile
            profile = await self.get_user_profile(user_id)
            
            # Count queries by type
            voice_count = (
                self.db.collection('voice_queries')
                .where('user_id', '==', user_id)
                .count()
                .get()
            )
            
            image_count = (
                self.db.collection('crop_analyses')
                .where('user_id', '==', user_id)
                .count()
                .get()
            )
            
            # Get most common crops
            analyses = (
                self.db.collection('crop_analyses')
                .where('user_id', '==', user_id)
                .stream()
            )
            
            crops = {}
            for doc in analyses:
                data = doc.to_dict()
                crop = data.get('crop_type', 'Unknown')
                crops[crop] = crops.get(crop, 0) + 1
            
            return {
                'total_queries': profile.get('queries_count', 0),
                'voice_queries': voice_count[0][0].value if voice_count else 0,
                'image_analyses': image_count[0][0].value if image_count else 0,
                'common_crops': sorted(crops.items(), key=lambda x: x[1], reverse=True)[:5],
                'member_since': profile.get('created_at'),
                'last_active': profile.get('last_active')
            }
            
        except Exception as e:
            logger.error(f"Statistics retrieval error: {str(e)}")
            return {}
    
    # ============= Feedback System =============
    
    async def store_feedback(
        self,
        interaction_id: str,
        rating: int,
        feedback_text: Optional[str] = None
    ) -> bool:
        """Store user feedback for an interaction"""
        try:
            interaction_ref = self.db.collection('interactions').document(interaction_id)
            
            interaction_ref.update({
                'satisfaction_rating': rating,
                'feedback': feedback_text,
                'feedback_timestamp': firestore.SERVER_TIMESTAMP
            })
            
            logger.info(f"Feedback stored for interaction: {interaction_id}")
            return True
            
        except Exception as e:
            logger.error(f"Feedback storage error: {str(e)}")
            return False
    
    # ============= Health Check =============
    
    def is_healthy(self) -> bool:
        """Check if Firebase connection is healthy"""
        try:
            # Try to read from Firestore
            self.db.collection('_health_check').limit(1).get()
            return True
        except:
            return False