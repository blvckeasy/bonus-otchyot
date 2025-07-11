const { Client } = require("pg");
const ExcelJS = require("exceljs");

async function main () {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "bonus_system",
        password: "1029",
        port: 5432,
    });

    const workbook = new ExcelJS.Workbook();

    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "Iyun", "Iyul"];

    try {
        await client.connect();

        for (let i = 0; i < months.length; i++) {
            const worksheet = workbook.addWorksheet(months[i]);

            worksheet.columns = [
                { header: "Hodim ID", key: 'emp_id' },
                { header: "Familiya Ism Sharfi", key: 'fullname' },
                { header: "Bank daromadi", key: 'revenue' },
                { header: "Ishlab topilgan bonus", key: 'amount' },
            ]

            const bonuses = (await client.query(`
                WITH all_bonuses AS (
                    SELECT 
                        emp_id, 
                        SUM(bonus_commission) AS amount,
                        margin_summ AS revenue
                    FROM loan_uzs_bonus
                    WHERE bonus_calculated_date >= to_date('01.0${i + 1}.2025', 'DD.MM.YYYY') AND bonus_calculated_date < to_date('01.0${i + 2}.2025', 'DD.MM.YYYY')
                    GROUP BY emp_id, margin_summ

                    UNION ALL

                    -- SELECT 
                    --     emp_id, 
                    --     SUM(bonus_commission) as amount,
                    --     net_profit_by_employee as revenue
                    -- FROM money_transfer_bonus
                    -- WHERE bonus_calculated_date >= to_date('01.0${i + 1}.2025', 'DD.MM.YYYY') AND bonus_calculated_date < to_date('01.0${i + 2}.2025', 'DD.MM.YYYY')
                    -- GROUP BY emp_id, net_profit_by_employee

                    -- UNION ALL

                    SELECT 
                        emp_id, 
                        SUM(bonus_commission) as amount, 
                        revenue
                    FROM payments_bonus
                    WHERE bonus_calculated_date >= to_date('01.0${i + 1}.2025', 'DD.MM.YYYY') AND bonus_calculated_date < to_date('01.0${i + 2}.2025', 'DD.MM.YYYY')
                    GROUP BY emp_id, revenue

                    UNION ALL

                    SELECT 
                        emp_id, 
                        SUM(bonus_commission) as amount,
                        SUM(branch_revenue) as revenue
                    FROM currency_exchange_sale_bonus
                    WHERE bonus_calculated_date >= to_date('01.0${i + 1}.2025', 'DD.MM.YYYY') AND bonus_calculated_date < to_date('01.0${i + 2}.2025', 'DD.MM.YYYY')
                    GROUP BY emp_id

                    UNION ALL

                    SELECT 
                        emp_id, 
                        SUM(bonus_commission) as amount,
                        SUM(branch_revenue) as revenue
                    FROM currency_exchange_buy_bonus
                    WHERE bonus_calculated_date >= to_date('01.0${i + 1}.2025', 'DD.MM.YYYY') AND bonus_calculated_date < to_date('01.0${i + 2}.2025', 'DD.MM.YYYY')
                    GROUP BY emp_id
                ),
                cte as (
                    select emp_id, fullname from employeers group by emp_id, fullname
                )

                SELECT 
                    e.emp_id,
                    e.fullname,    
                    ROUND(COALESCE(SUM(b.revenue), 0), 2)   AS "revenue",
                    ROUND(COALESCE(SUM(b.amount), 0), 2)   AS "amount"
                FROM all_bonuses b
                    RIGHT JOIN cte e ON b.emp_id = e.emp_id
                GROUP BY e.emp_id, e.fullname
                ORDER BY ROUND(COALESCE(SUM(b.revenue), 0), 2);    
            `)).rows;

            console.log(bonuses.length);

            for (const bonus of bonuses) {
                worksheet.addRow(bonus);
            }
        }

        await workbook.xlsx.writeFile('Bonus.xlsx');

    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();