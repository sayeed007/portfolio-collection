'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Input } from '@/components/ui/input';
import { initialCourse } from '@/lib/redux/slices/portfolioSlice';
import { BookOpen, Plus } from 'lucide-react';
import { useFieldArray, Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { z } from 'zod';

// Courses schema
export const coursesSchema = z.object({
    courses: z.array(z.object({
        name: z.string().min(1, 'Course name is required'),
        provider: z.string().min(1, 'Provider is required'),
        completionDate: z.string().min(1, 'Completion date is required'),
        duration: z.string().optional(),
    })).optional(),
});

interface CoursesSectionProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    register: UseFormRegister<any>;
}

export function CoursesSection({ control, errors, register }: CoursesSectionProps) {
    const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
        control,
        name: 'courses',
    });

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Courses
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => appendCourse({ ...initialCourse })}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                </Button>
            </div>

            {courseFields.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                    {'No courses added yet. Click "Add Course" to get started.'}
                </p>
            ) : (
                <div className="space-y-4">
                    {courseFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <Input
                                {...register(`courses.${index}.name`)}
                                label="Course Name"
                                placeholder="e.g., Introduction to Programming"
                                error={(errors.courses as any)?.[index]?.name?.message}
                                required
                            />

                            <Input
                                {...register(`courses.${index}.provider`)}
                                label="Provider"
                                placeholder="e.g., Coursera"
                                error={(errors.courses as any)?.[index]?.provider?.message}
                                required
                            />

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Input
                                        {...register(`courses.${index}.completionDate`)}
                                        type="date"
                                        label="Completion Date"
                                        error={(errors.courses as any)?.[index]?.completionDate?.message}
                                        required
                                    />
                                </div>

                                <DeleteButton
                                    alignWith="floating-input"
                                    onDelete={() => removeCourse(index)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}