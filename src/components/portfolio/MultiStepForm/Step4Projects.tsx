// src\components\portfolio\MultiStepForm\Step4Projects.tsx
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { z } from 'zod';
import { RootState } from '@/lib/redux/store';
import { updateFormData } from '@/lib/redux/slices/portfolioSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, Plus, Trash2, Code, Star, AlertCircle } from 'lucide-react';

// Validation schema
const step4Schema = z.object({
    projects: z.array(z.object({
        name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
        description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
        contribution: z.string().min(10, 'Contribution must be at least 10 characters').max(500, 'Contribution must be less than 500 characters'),
        technologies: z.array(z.string().min(1, 'Technology name cannot be empty')).min(1, 'At least one technology is required'),
    })).min(1, 'At least one project is required').max(10, 'Maximum 10 projects allowed'),
});

type Step4FormData = z.infer<typeof step4Schema>;

export function Step4Projects() {
    const dispatch = useDispatch();
    const { formData } = useSelector((state: RootState) => state.portfolio);
    const debounceRef = useRef<NodeJS.Timeout>();

    const {
        register,
        control,
        watch,
        setValue,
        getValues,
        formState: { errors, isValid },
        trigger,
    } = useForm<Step4FormData>({
        resolver: zodResolver(step4Schema),
        mode: 'onChange',
        defaultValues: {
            projects: formData.projects || [{
                name: '',
                description: '',
                contribution: '',
                technologies: ['']
            }],
        },
    });

    const { fields: projectFields, append: appendProject, remove: removeProject } = useFieldArray({
        control,
        name: 'projects',
    });

    // Debounced update function
    const debouncedUpdate = useCallback((data: Step4FormData) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            dispatch(updateFormData(data));
        }, 300); // 300ms debounce
    }, [dispatch]);

    // Watch for changes and update Redux store with debouncing
    useEffect(() => {
        const subscription = watch((data) => {
            // Only update if data is valid and not empty
            if (data.projects && data.projects.length > 0) {
                debouncedUpdate(data as Step4FormData);
            }
        });

        return () => {
            subscription.unsubscribe();
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [watch, debouncedUpdate]);

    const addProject = () => {
        if (projectFields.length < 10) {
            appendProject({
                name: '',
                description: '',
                contribution: '',
                technologies: ['']
            });
        }
    };

    const addTechnology = (projectIndex: number) => {
        const currentTechnologies = getValues(`projects.${projectIndex}.technologies`);
        if (currentTechnologies.length < 20) { // Limit technologies per project
            setValue(`projects.${projectIndex}.technologies`, [...currentTechnologies, '']);
            trigger(`projects.${projectIndex}.technologies`);
        }
    };

    const removeTechnology = (projectIndex: number, techIndex: number) => {
        const currentTechnologies = getValues(`projects.${projectIndex}.technologies`);
        if (currentTechnologies.length > 1) {
            const newTechnologies = currentTechnologies.filter((_, index) => index !== techIndex);
            setValue(`projects.${projectIndex}.technologies`, newTechnologies);
            trigger(`projects.${projectIndex}.technologies`);
        }
    };

    const updateTechnology = (projectIndex: number, techIndex: number, value: string) => {
        const currentTechnologies = getValues(`projects.${projectIndex}.technologies`);
        const newTechnologies = [...currentTechnologies];
        newTechnologies[techIndex] = value;
        setValue(`projects.${projectIndex}.technologies`, newTechnologies);
        trigger(`projects.${projectIndex}.technologies`);
    };

    // Suggested technologies for autocomplete/suggestions
    const suggestedTechnologies = [
        'React', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'C++',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'AWS', 'Docker', 'Kubernetes',
        'Express.js', 'Vue.js', 'Angular', 'React Native', 'Flutter', 'Swift', 'Kotlin',
        'TailwindCSS', 'Bootstrap', 'Material-UI', 'Figma', 'Git', 'GraphQL', 'REST API'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Portfolio</h2>
                <p className="text-gray-600">
                    Showcase your key projects, contributions, and technical expertise
                </p>
            </div>

            {/* Projects */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center">
                            <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
                            Projects ({projectFields.length}/10)
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Add your most significant projects that demonstrate your skills
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addProject}
                        disabled={projectFields.length >= 10}
                        className="flex items-center"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </div>

                {/* Form Validation Summary */}
                {Object.keys(errors).length > 0 && (
                    <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                            <p className="text-red-700 font-medium">Please fix the following errors:</p>
                        </div>
                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                            {errors.projects && typeof errors.projects.message === 'string' && (
                                <li>{errors.projects.message}</li>
                            )}
                            {errors.projects && Array.isArray(errors.projects) && errors.projects.map((projectError, index) => (
                                projectError && (
                                    <li key={index}>
                                        Project #{index + 1}: {
                                            Object.values(projectError).map((error: any) => error?.message).filter(Boolean).join(', ')
                                        }
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}

                <div className="space-y-8">
                    {projectFields.map((field, projectIndex) => (
                        <div key={field.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="space-y-6">
                                {/* Project Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                                        <h4 className="text-lg font-medium text-gray-900">
                                            Project #{projectIndex + 1}
                                        </h4>
                                    </div>
                                    {projectFields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeProject(projectIndex)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                {/* Project Name */}
                                <Input
                                    {...register(`projects.${projectIndex}.name`)}
                                    label="Project Name"
                                    placeholder="e.g., E-commerce Web Application, Mobile Banking App"
                                    error={errors.projects?.[projectIndex]?.name?.message}
                                    required
                                    maxLength={100}
                                />

                                {/* Project Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Project Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        {...register(`projects.${projectIndex}.description`)}
                                        rows={4}
                                        maxLength={1000}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                        placeholder="Provide a detailed description of the project, including its purpose, target audience, and key features. Mention the problem it solves and the value it provides. Include project scope, challenges faced, and outcomes achieved..."
                                    />
                                    {errors.projects?.[projectIndex]?.description && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.projects[projectIndex]?.description?.message}
                                        </p>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        <span>Minimum 20 characters. Be specific about goals, features, and impact.</span>
                                        <span>{watch(`projects.${projectIndex}.description`)?.length || 0}/1000</span>
                                    </div>
                                </div>

                                {/* Your Contribution */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Contribution & Role <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        {...register(`projects.${projectIndex}.contribution`)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                                        placeholder="Describe your specific role, responsibilities, and contributions to this project. What did you personally develop, design, or implement? Include leadership roles, key decisions, and measurable impact..."
                                    />
                                    {errors.projects?.[projectIndex]?.contribution && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.projects[projectIndex]?.contribution?.message}
                                        </p>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        <span>Highlight your personal contributions and achievements.</span>
                                        <span>{watch(`projects.${projectIndex}.contribution`)?.length || 0}/500</span>
                                    </div>
                                </div>

                                {/* Technologies Used */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Technologies Used <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {watch(`projects.${projectIndex}.technologies`)?.map((_, techIndex) => (
                                            <div key={techIndex} className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <input
                                                        {...register(`projects.${projectIndex}.technologies.${techIndex}`)}
                                                        list={`technologies-${projectIndex}-${techIndex}`}
                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                        placeholder="e.g., React.js, Node.js, MongoDB"
                                                        onChange={(e) => updateTechnology(projectIndex, techIndex, e.target.value)}
                                                    />
                                                    <datalist id={`technologies-${projectIndex}-${techIndex}`}>
                                                        {suggestedTechnologies.map((tech) => (
                                                            <option key={tech} value={tech} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {watch(`projects.${projectIndex}.technologies`)?.length < 20 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => addTechnology(projectIndex)}
                                                            className="flex items-center"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {watch(`projects.${projectIndex}.technologies`)?.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeTechnology(projectIndex, techIndex)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.projects?.[projectIndex]?.technologies && (
                                        <p className="text-red-500 text-sm mt-2">
                                            {errors.projects[projectIndex]?.technologies?.message}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                                        <Code className="w-4 h-4 mr-1" />
                                        List all programming languages, frameworks, tools, and platforms used.
                                    </p>
                                </div>

                                {/* Technology Preview */}
                                {watch(`projects.${projectIndex}.technologies`)?.filter(tech => tech.trim()).length > 0 && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h5 className="text-sm font-medium text-blue-900 mb-2">Technology Stack Preview:</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {watch(`projects.${projectIndex}.technologies`)
                                                ?.filter(tech => tech.trim())
                                                .map((tech, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Project Button (Alternative placement) */}
                {projectFields.length < 10 && (
                    <div className="mt-6 text-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProject}
                            className="w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Project
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                            You can add up to {10 - projectFields.length} more project(s)
                        </p>
                    </div>
                )}
            </Card>

            {/* Form Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                    {isValid ? (
                        <>
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-green-700 font-medium">Step 4 Complete</span>
                        </>
                    ) : (
                        <>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-yellow-700 font-medium">Please complete all required fields</span>
                        </>
                    )}
                </div>
                <span className="text-sm text-gray-500">
                    {projectFields.length} project{projectFields.length !== 1 ? 's' : ''} added
                </span>
            </div>

            {/* Tips Section */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Project Descriptions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Include quantifiable results and metrics where possible</li>
                    <li>• Mention the problem solved and business value created</li>
                    <li>• Highlight any leadership or collaborative aspects</li>
                    <li>• Specify your technical contributions and decision-making</li>
                    <li>• Include links to live demos or repositories if applicable</li>
                </ul>
            </Card>
        </div>
    );
}