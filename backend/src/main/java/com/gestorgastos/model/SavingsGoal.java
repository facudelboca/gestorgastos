package com.gestorgastos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "savings_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsGoal extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "El usuario asociado es requerido")
    private User user;

    @NotBlank(message = "El título de la meta de ahorro no puede estar vacío")
    @Size(max = 100, message = "El título no puede superar los 100 caracteres")
    @Column(nullable = false, length = 100)
    private String title;

    @NotNull(message = "El monto objetivo es requerido")
    @Positive(message = "El monto objetivo debe ser mayor a cero")
    @Column(name = "target_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal targetAmount;

    @NotNull(message = "El monto actual es requerido")
    @Column(name = "current_amount", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @NotNull(message = "La fecha límite es requerida")
    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @NotNull(message = "El estado de la meta es requerido")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SavingsGoalStatus status = SavingsGoalStatus.ACTIVE;
}
