"use client";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Viewport } from "next";
export const metadata = {
  title: "Class-Unity | Result Form"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

// ResultSchema types
const ResultSchemaWithTypes = ResultSchema.extend({
  id: z.number(),
  score: z.number().min(0).max(100),
  examId: z.number().optional(),
  assignmentId: z.number().optional(),
  studentId: z.string(),
});

type ResultFormData = z.infer<typeof ResultSchemaWithTypes>;

interface ResultFormProps {
  type: "create" | "update";
  data?: ResultFormData;
  setOpen: (open: boolean) => void;
  relatedData?: {
    exams: { id: number; title: string }[];
    assignments: { id: number; title: string }[];
    students: { id: string; name: string; surname: string }[];
  };
}

const ResultForm: React.FC<ResultFormProps> = ({
  type,
  data,
  setOpen,
  relatedData,
}) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ResultFormData>({
    resolver: zodResolver(ResultSchemaWithTypes),
    defaultValues: {
      id: data?.id || 0,
      score: data?.score || 0,
      examId: data?.examId,
      assignmentId: data?.assignmentId,
      studentId: data?.studentId || "",
    },
  });

  const score = watch("score");

  const handleScoreChange = (increment: number) => {
    const newScore = Math.min(100, Math.max(0, (score || 0) + increment));
    setValue("score", newScore);
  };

  const onSubmit = useCallback(async (formData: ResultFormData) => {
    try {
      const action = type === "create" ? createResult : updateResult;
      
      // Convert formData to FormData object
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formDataObj.append(key, value.toString());
        }
      });

      const result = await action(formData);

      if (result.success) {
        toast.success(
          `Result ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        throw new Error(result.message || "An error occurred");
      }
    } catch (error) {
      console.error(`Error during result ${type}:`, error);
      toast.error("An error occurred. Please try again.");
    }
  }, [type, setOpen, router]);

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a New Result" : "Update the Result"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <input type="hidden" {...register("id")} />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Score</label>
          <div className="flex items-center ring-[1.5px] ring-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              onClick={() => handleScoreChange(-1)}
              className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              -
            </button>
            <input
              type="number"
              {...register("score")}
              className="p-2 w-full text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="100"
            />
            <button
              type="button"
              onClick={() => handleScoreChange(1)}
              className="px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              +
            </button>
          </div>
          {errors.score && <p className="text-xs text-red-400">{errors.score.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Select Exam</label>
          <select
            {...register("examId", { valueAsNumber: true })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select an exam</option>
            {relatedData?.exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          {errors.examId && <p className="text-xs text-red-400">{errors.examId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Select Assignment</label>
          <select
            {...register("assignmentId", { valueAsNumber: true })}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select an assignment</option>
            {relatedData?.assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
          {errors.assignmentId && <p className="text-xs text-red-400">{errors.assignmentId.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Select Student</label>
          <select
            {...register("studentId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Select a student</option>
            {relatedData?.students.map((student) => (
              <option key={student.id} value={student.id}>
                {`${student.name} ${student.surname}`}
              </option>
            ))}
          </select>
          {errors.studentId && <p className="text-xs text-red-400">{errors.studentId.message}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-400 text-white p-2 rounded-md"
        >
          {type === "create" ? "Create" : "Update"} Result
        </button>
      </div>
    </form>
  );
};

export default ResultForm;
