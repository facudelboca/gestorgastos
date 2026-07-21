package com.gestorgastos.service;

import com.gestorgastos.model.Category;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import com.gestorgastos.util.SimilarityUtils;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CategorizationService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    private static final Map<String, List<String>> KEYWORDS_MAP = new HashMap<>();

    static {
        KEYWORDS_MAP.put("Comida", Arrays.asList("comida", "mcdonalds", "burger", "coto", "supermercado", "carrefour", "pizza", "restaurant", "starbucks", "almuerzo", "cena", "coca", "almacen"));
        KEYWORDS_MAP.put("Servicios", Arrays.asList("servicios", "luz", "agua", "gas", "internet", "netflix", "spotify", "expensas", "alquiler", "telecom", "fibertel", "edenor", "metrogas"));
        KEYWORDS_MAP.put("Educación", Arrays.asList("educacion", "facultad", "universidad", "cuota", "libros", "curso", "udemy", "platzi", "colegio"));
        KEYWORDS_MAP.put("Transporte", Arrays.asList("transporte", "uber", "cabify", "subte", "colectivo", "nafta", "combustible", "peaje", "estacionamiento", "sube", "taxi"));
        KEYWORDS_MAP.put("Entretenimiento", Arrays.asList("entretenimiento", "cine", "teatro", "boliche", "fiesta", "recital", "juego", "steam", "playstation", "xbox"));
        KEYWORDS_MAP.put("Salud", Arrays.asList("salud", "farmacia", "medico", "obra social", "dentista", "remedio", "medicamento", "clinica"));
    }

    public Optional<Category> suggestCategory(Long userId, String description) {
        if (description == null || description.isBlank()) {
            return Optional.empty();
        }

        List<Category> userCategories = categoryRepository.findByUserId(userId);
        if (userCategories.isEmpty()) {
            return Optional.empty();
        }

        String inputLower = description.toLowerCase().trim();

        double bestKeywordScore = 0.0;
        String suggestedCategoryName = null;

        for (Map.Entry<String, List<String>> entry : KEYWORDS_MAP.entrySet()) {
            String categoryGroup = entry.getKey();
            for (String keyword : entry.getValue()) {
                if (inputLower.contains(keyword)) {
                    bestKeywordScore = 1.0;
                    suggestedCategoryName = categoryGroup;
                    break;
                }
                
                double score = SimilarityUtils.jaroWinkler(inputLower, keyword);
                if (score > bestKeywordScore) {
                    bestKeywordScore = score;
                    suggestedCategoryName = categoryGroup;
                }
            }
            if (bestKeywordScore == 1.0) break;
        }

        if (bestKeywordScore >= 0.82 && suggestedCategoryName != null) {
            String targetName = suggestedCategoryName;
            Optional<Category> matchedCat = userCategories.stream()
                    .filter(c -> SimilarityUtils.jaroWinkler(c.getName(), targetName) >= 0.80)
                    .findFirst();
            if (matchedCat.isPresent()) {
                return matchedCat;
            }
        }

        List<Transaction> pastTransactions = transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                userId,
                com.gestorgastos.model.TransactionType.EXPENSE,
                java.time.OffsetDateTime.now().minusMonths(6),
                java.time.OffsetDateTime.now()
        );

        double bestHistoryScore = 0.0;
        Category historyCategorySuggestion = null;

        for (Transaction t : pastTransactions) {
            if (t.getDescription() == null || t.getDescription().isBlank()) continue;
            
            double score = SimilarityUtils.jaroWinkler(inputLower, t.getDescription());
            if (score > bestHistoryScore) {
                bestHistoryScore = score;
                historyCategorySuggestion = t.getCategory();
            }
        }

        if (bestHistoryScore >= 0.85 && historyCategorySuggestion != null) {
            return Optional.of(historyCategorySuggestion);
        }

        return Optional.of(userCategories.get(0));
    }
}
