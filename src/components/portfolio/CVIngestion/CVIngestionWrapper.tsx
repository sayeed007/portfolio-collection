'use client';

import { CVIngestionResult, createEntityResolver } from '@/lib/cv-ingestion';
import { DatabaseEntityResolver } from '@/lib/cv-ingestion/services/entity-resolver';
import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { AppDispatch } from '@/lib/redux/store';
import { Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import CVReviewModal from './CVReviewModal';
import CVUploadModal from './CVUploadModal';

interface CVIngestionWrapperProps {
  onComplete?: () => void;
}

export default function CVIngestionWrapper({ onComplete }: CVIngestionWrapperProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ingestionResult, setIngestionResult] = useState<CVIngestionResult | null>(null);
  const [entityResolver, setEntityResolver] = useState<DatabaseEntityResolver | null>(null);
  const [isLoadingResolver, setIsLoadingResolver] = useState(false);

  // Initialize entity resolver
  useEffect(() => {
    initializeResolver();
  }, []);

  const initializeResolver = async () => {
    setIsLoadingResolver(true);
    try {
      // Create resolver and load entities from Firestore
      const resolver = await createEntityResolver();
      setEntityResolver(resolver);
    } catch (error) {
      console.error('Failed to initialize entity resolver:', error);
      // Still create a resolver even if loading fails
      // It will work without entity matching
      setEntityResolver(new DatabaseEntityResolver());
    } finally {
      setIsLoadingResolver(false);
    }
  };

  const handleUploadSuccess = (result: CVIngestionResult) => {
    console.log('📄 CV parsed. Projects extracted:', result.parsedCV?.projects.length);
    console.log('📄 Projects data:', result.parsedCV?.projects);
    setIngestionResult(result);
    setShowUploadModal(false);
    setShowReviewModal(true);
  };

  const handleReviewApprove = async () => {
    if (!ingestionResult?.normalizationResult) return;

    try {
      const { formData, unmappedFields } = ingestionResult.normalizationResult;

      console.log('📋 Initial formData projects:', formData.projects?.length);
      console.log('📋 Initial formData education:', formData.education);
      console.log('🎓 Degrees:', formData.education?.map(e => e.degree));
      console.log('🏫 Institutions:', formData.education?.map(e => e.institution));

      // Extract unmapped categories from the parsed skills data
      const unmappedCategories: string[] = [];
      if (ingestionResult.parsedCV?.skills.categories) {
        for (const skillCategory of ingestionResult.parsedCV.skills.categories) {
          // Check if this category name appears in any existing category
          const categoryFound = formData.technicalSkills?.some(
            (ts) => ts.category === skillCategory.categoryName
          );
          if (!categoryFound && !unmappedCategories.includes(skillCategory.categoryName)) {
            unmappedCategories.push(skillCategory.categoryName);
          }
        }
      }

      // Create unmapped entities if any exist
      const hasUnmappedEntities =
        unmappedFields.degrees.length > 0 ||
        unmappedFields.institutions.length > 0 ||
        unmappedFields.skills.length > 0 ||
        unmappedCategories.length > 0;

      if (hasUnmappedEntities) {
        const { createUnmappedEntities } = await import(
          '@/lib/cv-ingestion/services/unmapped-entity-creator'
        );

        // Create missing entities
        const creationResult = await createUnmappedEntities({
          degrees: unmappedFields.degrees,
          institutions: unmappedFields.institutions,
          skills: unmappedFields.skills,
          skillCategories: unmappedCategories,
        });

        console.log('Created entities:', creationResult.created);

        // Re-map form data with refreshed entity resolver
        if (entityResolver && ingestionResult.parsedCV) {
          const { remapFormDataWithEntities } = await import(
            '@/lib/cv-ingestion/services/entity-remapper'
          );

          const remapResult = await remapFormDataWithEntities(
            formData,
            ingestionResult.parsedCV,
            entityResolver
          );

          console.log('Remapping complete. Remaining unmapped:', remapResult.remainingUnmapped);
          console.log('📊 Projects being dispatched:', remapResult.formData.projects?.length, 'projects');
          console.log('✅ AFTER REMAP - Degrees:', remapResult.formData.education?.map(e => e.degree));
          console.log('✅ AFTER REMAP - Institutions:', remapResult.formData.education?.map(e => e.institution));

          // Dispatch remapped form data
          dispatch(updateFormData(remapResult.formData));
        } else {
          // Fallback: use the old update method
          const updatedFormData = updateFormDataWithEntityIds(
            formData,
            creationResult,
          );
          dispatch(updateFormData(updatedFormData));
        }
      } else {
        // No unmapped entities, just dispatch as-is
        dispatch(updateFormData(formData));
      }

      // Close review modal
      setShowReviewModal(false);

      // Notify parent
      onComplete?.();
    } catch (error) {
      console.error('Error handling review approval:', error);
      // Still dispatch the form data even if entity creation fails
      if (ingestionResult?.normalizationResult) {
        dispatch(updateFormData(ingestionResult.normalizationResult.formData));
      }
      setShowReviewModal(false);
      onComplete?.();
    }
  };

  /**
   * Update form data with newly created entity IDs
   */
  const updateFormDataWithEntityIds = (
    formData: any,
    creationResult: any,
  ) => {
    const updated = { ...formData };

    // Update education with degree and institution IDs/names
    if (updated.education && Array.isArray(updated.education)) {
      updated.education = updated.education.map((edu: any) => ({
        ...edu,
        degree: creationResult.degreeMap.get(edu.degree) || edu.degree,
        institution: creationResult.institutionMap.get(edu.institution) || edu.institution,
      }));
    }

    // Update technical skills with category and skill IDs
    if (updated.technicalSkills && Array.isArray(updated.technicalSkills)) {
      updated.technicalSkills = updated.technicalSkills.map((techSkill: any) => {
        const updatedCategory =
          creationResult.categoryMap.get(techSkill.category) || techSkill.category;

        const updatedSkills = techSkill.skills.map((skill: any) => ({
          ...skill,
          skillId: creationResult.skillMap.get(skill.skillId) || skill.skillId,
        }));

        return {
          ...techSkill,
          category: updatedCategory,
          skills: updatedSkills,
        };
      });
    }

    return updated;
  };

  const handleReviewClose = () => {
    setShowReviewModal(false);
    setIngestionResult(null);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        disabled={isLoadingResolver}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4" />
        <span>Auto-Fill from CV</span>
      </button>

      {/* Upload Modal */}
      <CVUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        entityResolver={entityResolver || undefined}
      />

      {/* Review Modal */}
      {ingestionResult && (
        <CVReviewModal
          isOpen={showReviewModal}
          onClose={handleReviewClose}
          onApprove={handleReviewApprove}
          result={ingestionResult}
        />
      )}
    </>
  );
}
