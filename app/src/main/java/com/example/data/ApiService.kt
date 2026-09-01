package com.example.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.PATCH
import retrofit2.http.DELETE
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.Path
import retrofit2.http.Query

object ApiConfig {
    const val BASE_URL = "https://jambarrtech.vercel.app"
}

interface ApiService {
    @GET("api/products")
    suspend fun getProducts(
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("sort") sort: String? = null,
        @Query("featured") featured: String? = null,
        @Query("flash") flash: String? = null
    ): List<ProductResponse>

    @GET("api/products/{id}")
    suspend fun getProductById(@Path("id") id: String): ProductResponse

    @GET("api/products/featured")
    suspend fun getFeaturedProducts(): List<ProductResponse>

    @GET("api/products/flash")
    suspend fun getFlashProducts(): List<ProductResponse>

    @GET("api/categories")
    suspend fun getCategories(): List<CategoryResponse>

    @GET("api/stats")
    suspend fun getStats(@Header("Authorization") token: String? = null): StatsResponse

    @GET("api/orders")
    suspend fun getOrders(@Header("Authorization") token: String): List<OrderFullResponse>

    @GET("api/orders/{id}")
    suspend fun getOrderById(@Header("Authorization") token: String, @Path("id") id: String): OrderFullResponse

    @POST("api/orders")
    suspend fun createOrder(@Body order: CreateOrderRequest): OrderFullResponse

    @PATCH("api/orders/{id}/status")
    suspend fun updateOrderStatus(@Header("Authorization") token: String, @Path("id") id: String, @Body body: Map<String, String>): OrderFullResponse

    @GET("api/payments")
    suspend fun getPayments(@Header("Authorization") token: String): List<PaymentResponse>

    @GET("api/customers")
    suspend fun getCustomers(@Header("Authorization") token: String): List<CustomerResponse>

    @GET("api/managers")
    suspend fun getManagers(@Header("Authorization") token: String): List<ManagerResponse>

    @GET("api/reviews")
    suspend fun getReviews(
        @Query("status") status: String? = null,
        @Query("productId") productId: String? = null
    ): List<ReviewResponse>

    @POST("api/reviews")
    suspend fun createReview(@Body review: CreateReviewRequest): ReviewResponse

    @PATCH("api/reviews/{id}/approve")
    suspend fun approveReview(@Header("Authorization") token: String, @Path("id") id: String): ReviewResponse

    @DELETE("api/reviews/{id}")
    suspend fun deleteReview(@Header("Authorization") token: String, @Path("id") id: String): Any

    @GET("api/promotions")
    suspend fun getPromotions(): List<PromotionResponse>

    @GET("api/settings")
    suspend fun getSettings(): SettingsResponse

    @PUT("api/settings")
    suspend fun updateSettings(@Header("Authorization") token: String, @Body settings: SettingsResponse): SettingsResponse

    @GET("api/activity-logs")
    suspend fun getActivityLogs(@Header("Authorization") token: String): List<ActivityLogResponse>

    @POST("api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body user: RegisterRequest): AuthResponse

    @GET("api/auth/me")
    suspend fun getMe(@Header("Authorization") token: String): UserResponse

    @POST("api/products")
    suspend fun createProduct(@Header("Authorization") token: String, @Body product: CreateProductRequest): ProductResponse

    @PUT("api/products/{id}")
    suspend fun updateProduct(@Header("Authorization") token: String, @Path("id") id: String, @Body product: CreateProductRequest): ProductResponse

    @DELETE("api/products/{id}")
    suspend fun deleteProduct(@Header("Authorization") token: String, @Path("id") id: String): Any
}

// ===== RESPONSE DATA CLASSES =====

data class ProductResponse(
    val id: String,
    val name: String,
    val reference: String,
    val price: Double,
    val oldPrice: Double?,
    val stock: Int,
    val imageUrl: String,
    val description: String?,
    val isFeatured: Boolean,
    val isFlash: Boolean,
    val categoryId: String,
    val category: CategoryResponse?,
    val _count: CountResponse? = null
)

data class CountResponse(
    val reviews: Int? = null,
    val orderItems: Int? = null,
    val products: Int? = null
)

data class CategoryResponse(
    val id: String,
    val name: String,
    val icon: String?,
    val _count: CountResponse? = null
)

data class StatsResponse(
    val totalRevenue: Double,
    val ordersCount: Int,
    val customersCount: Int,
    val productsCount: Int,
    val paymentsCount: Int,
    val averageBasket: Double,
    val recentOrders: List<RecentOrderResponse>?,
    val lowStockProducts: List<LowStockProductResponse>?
)

data class RecentOrderResponse(
    val id: String,
    val reference: String,
    val clientName: String,
    val totalAmount: Double,
    val status: String,
    val paymentMethod: String
)

data class LowStockProductResponse(
    val id: String,
    val name: String,
    val stock: Int
)

data class ReviewResponse(
    val id: String,
    val clientName: String,
    val rating: Int,
    val comment: String,
    val status: String,
    val product: ProductResponse?
)

data class CreateReviewRequest(
    val productId: String?,
    val clientName: String,
    val rating: Int,
    val comment: String
)

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val phone: String, val password: String, val role: String?)
data class AuthResponse(val user: UserResponse, val token: String)
data class UserResponse(val id: String, val name: String, val email: String, val phone: String, val role: String)

data class OrderFullResponse(
    val id: String,
    val reference: String,
    val clientName: String,
    val clientPhone: String?,
    val clientAddress: String?,
    val totalAmount: Double,
    val status: String,
    val paymentMethod: String,
    val createdAt: String?,
    val items: List<OrderItemFullResponse>?
)

data class OrderItemFullResponse(
    val id: String,
    val productId: String,
    val quantity: Int,
    val price: Double,
    val product: ProductResponse?
)

data class OrderResponse(
    val id: String,
    val reference: String,
    val status: String,
    val totalAmount: Double,
    val items: List<OrderItemResponse>?
)

data class OrderItemResponse(val id: String, val productId: String, val quantity: Int, val price: Double)
data class CreateOrderRequest(
    val clientName: String,
    val clientPhone: String?,
    val clientAddress: String?,
    val paymentMethod: String,
    val items: List<OrderItemRequest>
)
data class OrderItemRequest(val productId: String, val quantity: Int)

data class PaymentResponse(
    val id: String,
    val reference: String,
    val orderId: String?,
    val clientName: String,
    val amount: Double,
    val method: String,
    val status: String,
    val createdAt: String?
)

data class CustomerResponse(
    val id: String,
    val name: String,
    val phone: String?,
    val email: String?,
    val ordersCount: Int,
    val totalSpent: Double
)

data class ManagerResponse(
    val id: String,
    val name: String,
    val email: String,
    val role: String
)

data class PromotionResponse(
    val id: String,
    val title: String,
    val discountPercent: Int,
    val targetCategory: String,
    val startDate: String?,
    val endDate: String?,
    val isActive: Boolean
)

data class SettingsResponse(
    val id: String,
    val storeName: String,
    val storeEmail: String,
    val phone: String,
    val address: String,
    val logoUrl: String?,
    val commissionRate: Double,
    val minCommission: Double
)

data class ActivityLogResponse(
    val id: String,
    val action: String,
    val user: String,
    val module: String,
    val ipAddress: String?,
    val result: String,
    val createdAt: String?
)

data class CreateProductRequest(
    val name: String,
    val reference: String,
    val price: Double,
    val oldPrice: Double? = null,
    val stock: Int,
    val imageUrl: String,
    val categoryId: String,
    val isFeatured: Boolean = false,
    val isFlash: Boolean = false,
    val description: String? = null
)

object ApiClient {
    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL + "/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
