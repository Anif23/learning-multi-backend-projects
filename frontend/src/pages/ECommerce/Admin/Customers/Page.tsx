// pages/Admin/Ecommerce/Customers/index.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  ShoppingBag,
  Heart,
  IndianRupee,
} from "lucide-react";

import PageHeader from "../../../../components/Ecommerce/Admin/PageHeader";
import StatsCard from "../../../../components/Ecommerce/StatsCard";
import FilterBar from "../../../../components/Ecommerce/Admin/FilterBar";
import DataTable from "../../../../components/Ecommerce/Admin/DataTable";
import Pagination from "../../../../components/Ecommerce/Admin/Pagination";

import {
  useAdminCustomers,
  useUpdateCustomer,
  useDeleteCustomer,
} from "../../../../hooks/admin/useAdminCustomer";

const Customers = () => {
  const navigate =
    useNavigate();

  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const { data, isLoading } =
    useAdminCustomers({
      page,
      search,
    });

  const customers =
    data?.data || [];

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    updateCustomer.mutate(
      { id: editingCustomer.id, data: { username, email } },
      {
        onSuccess: () => {
          setEditingCustomer(null);
        },
      }
    );
  };

  const handleDelete = (row: any) => {
    if (window.confirm(`Are you sure you want to delete customer ${row.username}?`)) {
      deleteCustomer.mutate(row.id);
    }
  };

  const pg =
    data?.pagination || {};

  const columns = [
    {
      header: "Customer",

      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-bold">
            {row.username?.[0]}
          </div>

          <div>
            <p className="font-medium">
              {row.username}
            </p>

            <p className="text-xs text-gray-400">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },

    {
      header: "Orders",

      accessor: "orderCount",
    },

    {
      header: "Wishlist",

      accessor:
        "wishlistCount",
    },

    {
      header: "Spent",

      render: (row: any) =>
        `${row.totalSpent}`,
    },

    {
      header: "Joined",

      render: (row: any) =>
        new Date(
          row.createdAt
        ).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">

      <PageHeader
        title="Customers"
        subtitle="Manage and monitor customer activity"
        // buttonText="Push Notifications"
        // onClick={() =>
        //   navigate(
        //     "/admin/ecommerce/notifications"
        //   )
        // }
      />

      <div className="grid md:grid-cols-4 gap-5">

        <StatsCard
          title="Customers"
          value={pg.total || 0}
          icon={<Users />}
        />

        <StatsCard
          title="Orders"
          value={customers.reduce(
            (
              acc: number,
              item: any
            ) =>
              acc +
              item.orderCount,
            0
          )}
          icon={
            <ShoppingBag />
          }
        />

        <StatsCard
          title="Wishlist"
          value={customers.reduce(
            (
              acc: number,
              item: any
            ) =>
              acc +
              item.wishlistCount,
            0
          )}
          icon={<Heart />}
        />

        <StatsCard
          title="Revenue"
          value={`${customers.reduce(
            (
              acc: number,
              item: any
            ) =>
              acc +
              item.totalSpent,
            0
          )}`}
          icon={
            <IndianRupee />
          }
        />

      </div>

      <FilterBar
        search={search}
        setSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        total={pg.total || 0}
      />

      <DataTable
        loading={isLoading}
        columns={columns}
        rows={customers}
        actions={{
          onView: (row) =>
            navigate(
              `/admin/ecommerce/customer/${row.id}`
            ),
          onEdit: (row) => {
            setEditingCustomer(row);
            setUsername(row.username);
            setEmail(row.email);
          },
          onDelete: handleDelete,
        }}
      />

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl border">
            <h3 className="text-xl font-bold mb-4">Edit Customer</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateCustomer.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-neutral-800 rounded-xl disabled:bg-gray-400"
                >
                  {updateCustomer.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Pagination
        page={pg.page}
        totalPages={
          pg.totalPages
        }
        hasNext={pg.hasNext}
        hasPrev={pg.hasPrev}
        setPage={setPage}
      />

    </div>
  );
};

export default Customers;