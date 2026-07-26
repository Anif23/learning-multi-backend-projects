import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminAPI } from "../../api/admin";
import { qk } from "../../utils/queryKeys";

export const useAdminCustomers = (params: any) =>
  useQuery({
    queryKey: [qk.adminCustomers, params],

    queryFn: async () => {
      const res = await adminAPI.customers(params);

      return res.data;
    },
  });

export const useAdminCustomer = (id: number | string) =>
  useQuery({
    queryKey: [qk.adminCustomers, id],
    queryFn: async () => {
      const res = await adminAPI.customer(id);
      return res.data;
    },
    enabled: !!id,
  });

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: any }) => {
      const res = await adminAPI.updateCustomer(id, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [qk.adminCustomers] });
      toast.success("Customer updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update customer");
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await adminAPI.deleteCustomer(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [qk.adminCustomers] });
      toast.success("Customer deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete customer");
    }
  });
};
