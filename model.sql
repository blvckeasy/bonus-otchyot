WITH all_bonuses AS (
    SELECT 
        emp_id, 
        SUM(bonus_commission) AS amount,
        margin_summ AS revenue
    FROM loan_uzs_bonus
    WHERE bonus_calculated_date BETWEEN to_date('01.01.2025', 'DD.MM.YYYY') AND to_date('01.02.2025', 'DD.MM.YYYY')
    GROUP BY emp_id, margin_summ

    UNION ALL

    -- SELECT 
    --     emp_id, 
    --     SUM(bonus_commission) as amount,
    --     net_profit_by_employee as revenue
    -- FROM money_transfer_bonus
    -- WHERE bonus_calculated_date BETWEEN to_date('01.01.2025', 'DD.MM.YYYY') AND to_date('01.02.2025', 'DD.MM.YYYY')
    -- GROUP BY emp_id, net_profit_by_employee

    -- UNION ALL

    SELECT 
        emp_id, 
        SUM(bonus_commission) as amount, 
        revenue
    FROM payments_bonus
    WHERE bonus_calculated_date BETWEEN to_date('01.01.2025', 'DD.MM.YYYY') AND to_date('01.02.2025', 'DD.MM.YYYY')
    GROUP BY emp_id, revenue

    UNION ALL

    SELECT 
        emp_id, 
        SUM(bonus_commission) as amount,
        SUM(branch_revenue) as revenue
    FROM currency_exchange_sale_bonus
    WHERE bonus_calculated_date BETWEEN to_date('01.01.2025', 'DD.MM.YYYY') AND to_date('01.02.2025', 'DD.MM.YYYY')
    GROUP BY emp_id

    UNION ALL

    SELECT 
        emp_id, 
        SUM(bonus_commission) as amount,
        SUM(branch_revenue) as revenue
    FROM currency_exchange_buy_bonus
    WHERE bonus_calculated_date BETWEEN to_date('01.01.2025', 'DD.MM.YYYY') AND to_date('01.02.2025', 'DD.MM.YYYY')
    GROUP BY emp_id
),
cte as (
    select emp_id, fullname from employeers group by emp_id, fullname
)

SELECT 
    e.emp_id,
    e.fullname,    
    ROUND(COALESCE(SUM(b.amount), 0), 2)   AS "amount",
    ROUND(COALESCE(SUM(b.revenue), 0), 2)   AS "revenue"
FROM all_bonuses b
    INNER JOIN cte e ON b.emp_id = e.emp_id
GROUP BY e.emp_id, e.fullname
ORDER BY e.emp_id;