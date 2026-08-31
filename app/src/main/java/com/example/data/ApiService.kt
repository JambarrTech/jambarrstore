package com.example.data

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Body
import retrofit2.http.Query

object ApiConfig {
    const val BASE_URL = "https://your-project.vercel.app"
}

interface ApiService {
    @GET("api/products")
    suspend fun getProducts(
        @Query("search") search: String? = null,
        @Query("category") category: String? = null,
        @Query("sort") sort: String? = null
    ): List<ProductResponse>

    @GET("api/categories")
    suspend fun getCategories(): List<CategoryResponse>

    @GET("api/stats")
    suspend fun getStats(): StatsResponse

    @POST("api/orders")
    suspend fun createOrder(@Body order: CreateOrderRequest): OrderResponse
}

data class ProductResponse(
    val id: String,
    val name: String,
    val price: Double,
    val oldPrice: Double?,
    val stock: Int,
    val imageUrl: String,
    val description: String?,
    val isFeatured: Boolean,
    val isFlash: Boolean,
    val category: CategoryResponse?
)

data class CategoryResponse(
    val id: String,
    val name: String,
    val icon: String?
)

data class StatsResponse(
    val totalRevenue: String,
    val ordersCount: Int,
    val customersCount: Int,
    val productsCount: Int,
    val averageBasket: String
)

data class OrderResponse(
    val id: String,
    val reference: String,
    val status: String
)

data class CreateOrderRequest(
    val clientName: String,
    val totalAmount: Double,
    val paymentMethod: String,
    val items: List<OrderItemRequest>
)

data class OrderItemRequest(
    val productId: String,
    val quantity: Int,
    val price: Double
)

object ApiClient {
    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
