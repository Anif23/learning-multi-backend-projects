import { prisma } from "../../../config/prisma.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import { getPagination, getMeta } from "../../../utils/pagination.js";
import { searchBy } from "../../../utils/common.js";

export const adminCustomerController = {

    getAllCustomers: asyncHandler(
        async (req, res) => {

            const {
                search,
                page = 1,
            } = req.query;

            const { limit } =
                getPagination(req.query);

            const currentPage =
                Number(page);

            const where = {
                role: "USER",

                ...searchBy(
                    "username",
                    search
                ),
            };

            const total =
                await prisma.user.count({
                    where,
                });

            const users =
                await prisma.user.findMany({
                    where,

                    skip:
                        (currentPage - 1) *
                        limit,

                    take: limit,

                    orderBy: {
                        createdAt: "desc",
                    },

                    include: {
                        orders: true,

                        wishlist: {
                            include: {
                                items: true,
                            },
                        },

                        notifications: {
                            orderBy: {
                                createdAt: "desc",
                            },

                            take: 5,
                        },
                    },
                });

            const data =
                users.map((u) => ({
                    id: u.id,

                    username:
                        u.username,

                    email:
                        u.email,

                    createdAt:
                        u.createdAt,

                    orderCount:
                        u.orders.length,

                    wishlistCount:
                        u.wishlist?.items
                            ?.length || 0,

                    totalSpent:
                        u.orders.reduce(
                            (acc, item) =>
                                acc +
                                item.totalAmount,
                            0
                        ),

                    notifications:
                        u.notifications,
                }));

            res.json({
                success: true,

                data,

                pagination:
                    getMeta(
                        total,
                        currentPage,
                        limit
                    ),
            });
        }
    ),

    getCustomerById: asyncHandler(async (req, res) => {
        const customer = await prisma.user.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                orders: true,
                addresses: true,
                wishlist: { include: { items: true } },
                notifications: { orderBy: { createdAt: "desc" } }
            }
        });
        if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
        res.json({ success: true, data: customer });
    }),

    updateCustomer: asyncHandler(async (req, res) => {
        const { username, email } = req.body;
        const customer = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data: { username, email }
        });
        res.json({ success: true, data: customer });
    }),

    deleteCustomer: asyncHandler(async (req, res) => {
        await prisma.user.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, message: "Customer deleted successfully" });
    })

};
