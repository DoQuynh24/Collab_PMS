import { useMutation, useQueryClient } from "@tanstack/react-query";
import { URL_API_GET_PROJECT } from "../../../constant/config";
import type { IProject, CreateProjectPayload } from "../types";
import type { MutationConfig } from "../../../lib/react-query";
import apiClient from "../../../lib/api";
export const createProject = async (
  data: CreateProjectPayload
): Promise<IProject> => {    const response = await apiClient.post(
        `${URL_API_GET_PROJECT}`,
        data,
    );
    return response.data;
};

type UseCreateProjectOptions = {
    config?: MutationConfig<typeof createProject>;
};

export const useCreateProject = ({ config }: UseCreateProjectOptions = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProject,
        onMutate: () => {},
        onError: () => {},
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["projects"],
            });
        },
        ...config,
    });
};
