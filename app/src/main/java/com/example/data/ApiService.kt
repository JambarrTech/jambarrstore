package com.example.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.POST
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
    suspend fun getProductById(
        @Path("id") id: String
    ): ProductResponse

    @GET("api/categories")
    suspend fun getCategories(): List<CategoryResponse>

    @GET("api/stats")
    suspend fun getStats(
        @Header("Authorization") token: String? = null
    ): StatsResponse

    @POST("api/orders")
    suspend fun createOrder(@Body order: CreateOrderRequest): OrderResponse

    @GET("api/reviews")
    suspend fun getReviews(
        @Query("status") status: String? = null,
        @Query("productId") productId: String? = null
    ): List<ReviewResponse>

    @POST("api/reviews")
    suspend fun createReview(@Body review: CreateReviewRequest): ReviewResponse

    @POST("api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body user: RegisterRequest): AuthResponse

    @GET("api/auth/me")
    suspend fun getMe(@Header("Authorization") token: String): UserResponse
}

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
    val category: CategoryResponse?
)

data class CategoryResponse(
    val id: String,
    val name: String,
    val icon: String?
)

data class StatsResponse(
    val totalRevenue: Double,
    val ordersCount: Int,
    val customersCount: Int,
    val productsCount: Int,
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

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val phone: String,
    val password: String,
    val role: String?
)

data class AuthResponse(
    val user: UserResponse,
    val token: String
)

data class UserResponse(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val role: String
)

data class OrderResponse(
    val id: String,
    val reference: String,
    val status: String,
    val totalAmount: Double,
    val items: List<OrderItemResponse>?
)

data class OrderItemResponse(
    val id: String,
    val productId: String,
    val quantity: Int,
    val price: Double
)

data class CreateOrderRequest(
    val clientName: String,
    val clientPhone: String?,
    val clientAddress: String?,
    val paymentMethod: String,
    val items: List<OrderItemRequest>
)

data class OrderItemRequest(
    val productId: String,
    val quantity: Int
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
