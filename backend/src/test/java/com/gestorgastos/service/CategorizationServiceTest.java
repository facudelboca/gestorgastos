package com.gestorgastos.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.gestorgastos.model.Category;
import com.gestorgastos.model.Transaction;
import com.gestorgastos.model.TransactionType;
import com.gestorgastos.repository.CategoryRepository;
import com.gestorgastos.repository.TransactionRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class CategorizationServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CategorizationService categorizationService;

    private Category comida;
    private Category servicios;
    private Category transporte;
    private List<Category> userCategories;

    @BeforeEach
    public void setUp() {
        comida = Category.builder().id(1L).name("Comida").icon("🍔").build();
        servicios = Category.builder().id(2L).name("Servicios").icon("🔌").build();
        transporte = Category.builder().id(3L).name("Transporte").icon("🚗").build();
        userCategories = Arrays.asList(comida, servicios, transporte);
    }

    @Test
    public void testSuggestCategory_predefinedKeyword_shouldSuggestCorrectCategory() {
        // GIVEN
        when(categoryRepository.findByUserId(1L)).thenReturn(userCategories);

        // WHEN - Probando palabras clave directas
        Optional<Category> suggestion1 = categorizationService.suggestCategory(1L, "Netflix suscripción");
        Optional<Category> suggestion2 = categorizationService.suggestCategory(1L, "Mc Donalds almuerzo");
        Optional<Category> suggestion3 = categorizationService.suggestCategory(1L, "Viaje Uber");

        // THEN
        assertTrue(suggestion1.isPresent());
        assertEquals("Servicios", suggestion1.get().getName());

        assertTrue(suggestion2.isPresent());
        assertEquals("Comida", suggestion2.get().getName());

        assertTrue(suggestion3.isPresent());
        assertEquals("Transporte", suggestion3.get().getName());
    }

    @Test
    public void testSuggestCategory_fuzzyKeywordMatching_shouldMatchKeywords() {
        // GIVEN
        when(categoryRepository.findByUserId(1L)).thenReturn(userCategories);

        // WHEN - Probando similitud Jaro-Winkler sobre palabras clave predefinidas aproximadas
        Optional<Category> suggestion1 = categorizationService.suggestCategory(1L, "Netflx premium"); // Netflx (error de tipeo)
        Optional<Category> suggestion2 = categorizationService.suggestCategory(1L, "supermercado coto");

        // THEN
        assertTrue(suggestion1.isPresent());
        assertEquals("Servicios", suggestion1.get().getName());

        assertTrue(suggestion2.isPresent());
        assertEquals("Comida", suggestion2.get().getName());
    }

    @Test
    public void testSuggestCategory_historicalMatching_shouldLearnFromHistory() {
        // GIVEN
        when(categoryRepository.findByUserId(1L)).thenReturn(userCategories);

        // Simulamos una transacción histórica de ocio
        Category ocio = Category.builder().id(4L).name("Ocio").icon("🎮").build();
        Transaction historicalTx = Transaction.builder()
                .description("compra de juegos en steam")
                .category(ocio)
                .build();

        when(transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                eq(1L), eq(TransactionType.EXPENSE), any(), any()
        )).thenReturn(Collections.singletonList(historicalTx));

        // WHEN - Ingresamos un concepto difuso similar al del historial ("steam juego")
        Optional<Category> suggestion = categorizationService.suggestCategory(1L, "compra de juegos steam");

        // THEN - Debería sugerir "Ocio" ya que Jaro-Winkler coincide con la transacción pasada
        assertTrue(suggestion.isPresent());
        assertEquals("Ocio", suggestion.get().getName());
    }

    @Test
    public void testSuggestCategory_noMatch_shouldFallbackToFirstCategory() {
        // GIVEN
        when(categoryRepository.findByUserId(1L)).thenReturn(userCategories);
        when(transactionRepository.findByAccountUserIdAndTypeAndTransactionDateBetween(
                eq(1L), eq(TransactionType.EXPENSE), any(), any()
        )).thenReturn(Collections.emptyList());

        // WHEN - Un concepto totalmente aleatorio sin similitud
        Optional<Category> suggestion = categorizationService.suggestCategory(1L, "xyzabc");

        // THEN - Debería retornar el primer elemento de la lista (comida) como fallback
        assertTrue(suggestion.isPresent());
        assertEquals("Comida", suggestion.get().getName());
    }
}
