import { useState } from "react"
import { RecipeService } from "../services/recipeService"

const AIFoodSuggestion = () => {
  const [ingredients, setIngredients] = useState("")
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [recipeDetail, setRecipeDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!ingredients.trim()) {
      setError("Vui lòng nhập nguyên liệu")
      return
    }

    setLoading(true)
    setError("")
    setRecipes([])

    try {
      const response = await RecipeService.getRecipeAI(ingredients)
      setRecipes(response)
    } catch (error) {
      console.error("Error fetching recipes:", error)
      setError("Không thể tải công thức. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (recipe) => {
    setSelectedRecipe(recipe)
    setShowModal(true)
    setDetailLoading(true)
    setRecipeDetail(null)

    try {
      const detail = await RecipeService.getRecipeAIById(recipe.id)
      setRecipeDetail(detail)
    } catch (error) {
      console.error("Error fetching recipe detail:", error)
      setError("Không thể tải chi tiết công thức")
    } finally {
      setDetailLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecipe(null)
    setRecipeDetail(null)
    setDetailLoading(false)
  }

  return (
    <div className="bg-gray-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance px-2">AI gợi ý bữa ăn cho bạn</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto text-pretty px-4">
            Hãy để Cookbot đồng hành cùng bạn trong hành trình chăm sóc sức khỏe – với thực đơn cá nhân hóa phù hợp với
            chế độ ăn uống, sở thích và mục tiêu của riêng bạn.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="relative">
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Thịt gà, cơm, hành tây, trứng"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm"
              style={{ '--tw-ring-color': '#228B22' }}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #228B22'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
            <button
              type="submit"
              className="absolute right-1 sm:right-2 top-1 sm:top-2 bottom-1 sm:bottom-2 px-3 sm:px-6 py-1 sm:py-2 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base"
              style={{ backgroundColor: '#228B22' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1E7B1E'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#228B22'}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">Tạo công thức</span>
              <span className="sm:hidden">Tạo</span>
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg mx-2 sm:mx-0">
            <p className="text-red-600 text-xs sm:text-sm text-center">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mx-2 sm:mx-0">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500"></div>
              <p className="ml-2 sm:ml-3 text-gray-600 text-sm sm:text-base">Đang tìm công thức cho bạn...</p>
            </div>
          </div>
        )}

        {/* Recipe Results Section */}
        {recipes.length > 0 && !loading && (
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-100 mx-2 sm:mx-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Công thức được đề xuất</h3>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {recipes.map((recipe, index) => (
                <div key={recipe.id || index} className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight pr-2">{recipe.title}</h4>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {recipe.usedIngredientCount || 0} có sẵn
                    </span>
                  </div>
                  
                  {recipe.image && (
                    <div className="mb-3 sm:mb-4">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Nguyên liệu cần thiết:</h5>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {recipe.missedIngredientCount || 0} nguyên liệu cần mua thêm
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-purple-200">
                      <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      </div>
                      <button 
                        className="text-purple-600 hover:text-purple-700 font-medium text-xs sm:text-sm transition-colors duration-200"
                        onClick={() => handleViewDetail(recipe)}
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Detail Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 transition-opacity duration-300">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 transition-opacity duration-300"
              onClick={closeModal}
            />
            
            {/* Modal */}
            <div className="relative flex items-center justify-center min-h-screen p-2 sm:p-4">
              <div className="relative bg-white rounded-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 pr-2">
                    {selectedRecipe?.title}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500"></div>
                    <p className="ml-2 sm:ml-3 text-gray-600 text-sm sm:text-base">Đang tải chi tiết công thức...</p>
                  </div>
                ) : recipeDetail ? (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Recipe Image */}
                    {recipeDetail.image && (
                      <div className="w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                        <img 
                          src={recipeDetail.image} 
                          alt={recipeDetail.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Recipe Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">Tổng thời gian</h3>
                        <p className="text-blue-600 text-sm sm:text-base">{recipeDetail.readyInMinutes || 'N/A'} phút</p>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Nguyên liệu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {recipeDetail.extendedIngredients?.map((ingredient, index) => (
                          <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 text-sm sm:text-base">
                              {ingredient.amount} {ingredient.unit} {ingredient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Hướng dẫn nấu</h3>
                      <div className="space-y-3 sm:space-y-4">
                        {recipeDetail.analyzedInstructions?.[0]?.steps?.map((step, index) => (
                          <div key={index} className="flex space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm">
                              {step.number}
                            </div>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{step.step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Info */}
                    {recipeDetail.nutrition && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Thông tin dinh dưỡng</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                              {Math.round(recipeDetail.nutrition.nutrients?.find(n => n.name === 'Calories')?.amount || 0)}
                            </p>
                            <p className="text-xs sm:text-sm text-orange-700">Calories</p>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                              {Math.round(recipeDetail.nutrition.nutrients?.find(n => n.name === 'Protein')?.amount || 0)}g
                            </p>
                            <p className="text-xs sm:text-sm text-red-700">Protein</p>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
                              {Math.round(recipeDetail.nutrition.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0)}g
                            </p>
                            <p className="text-xs sm:text-sm text-yellow-700">Carbs</p>
                          </div>
                          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                              {Math.round(recipeDetail.nutrition.nutrients?.find(n => n.name === 'Fat')?.amount || 0)}g
                            </p>
                            <p className="text-xs sm:text-sm text-green-700">Fat</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Source Link */}
                    <div className="pt-4 sm:pt-6 border-t border-gray-200">
                      <a
                        href={recipeDetail.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-white font-medium rounded-lg transition-all duration-200 text-sm sm:text-base"
                        style={{ backgroundColor: '#228B22' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#1E7B1E'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#228B22'}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Xem công thức gốc
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-gray-500 text-sm sm:text-base">Không thể tải chi tiết công thức</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIFoodSuggestion
