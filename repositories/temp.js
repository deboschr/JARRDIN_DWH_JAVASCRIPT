const {
  OutletModel,
  UserModel,
  AccountModel,
  AccountMutationModel,
  AccountMutationDetailModel,
  OutletAccountModel,
} = require("../models/index.js");

const {
  DatabaseManager,
  Sequelize,
  Op,
} = require("../config/DatabaseManager.js");
const SparksDB = DatabaseManager.getDatabase(process.env.DB_NAME);

class AccountMutationRepository {
  static async readAll(dataQuery, dataUser, type) {
    try {
      const options = {
        order: [["TransactionDate", "DESC"]],

        where: {
          EnterpriseID: dataUser.EnterpriseID,
          ...(dataQuery.startDate && dataQuery.endDate && {
            TransactionDate: {
              [Sequelize.Op.between]: [
                dataQuery.startDate,
                dataQuery.endDate,
              ],
            },
          }),
          ...(dataUser.OutletID && {
            OutletID: dataUser.OutletID,
          }),
          Type: type,
        },
        include: [
          {
            model: OutletModel,
            required: true,
            attributes: ["OutletID", "Name"],
            where: dataUser.OutletID
              ? {
                EnterpriseID: dataUser.EnterpriseID,
                OutletID: dataUser.OutletID,
              }
              : { EnterpriseID: dataUser.EnterpriseID },
          },
          {
            model: AccountModel,
            required: true,
            attributes: ["AccountID", "Name", "Code"],
          },
          {
            model: AccountMutationDetailModel,
            required: true,
            include: [
              {
                model: AccountModel,
                required: false,
                attributes: ["AccountID", "Name", "Code"],
              },
            ],
          },
        ],
      };

      const formatResult = (rows) => {
        return rows.map((AM) => {
          return {
            AccountMutationID: AM.AccountMutationID,
            Description: AM.Description,
            NoTransaction: AM.NoTransaction,
            TransactionDate: AM.TransactionDate,
            TotalAmount: parseFloat(AM.TotalAmount),
            Type: AM.Type,
            Outlet: AM.Outlet,
            Account: AM.Account,
            AccountMutationDetails: AM.AccountMutationDetails.map((AMD) => ({
              AccountMutationDetailID: AMD.AccountMutationDetailID,
              Description: AMD.Description,
              Amount: parseFloat(AMD.Amount),
              Account: AMD.Account,
            })),
          };
        });
      };

      if (dataQuery.page && dataQuery.limit) {
        const limit = parseInt(dataQuery.limit, 10);
        const offset = parseInt(dataQuery.page, 10) * limit;

        const count = await AccountMutationModel.count({
          where: dataUser.OutletID
            ? {
              EnterpriseID: dataUser.EnterpriseID,
              OutletID: dataUser.OutletID,
              Type: type,
            }
            : {
              EnterpriseID: dataUser.EnterpriseID,
              Type: type,
            },
        });

        options.limit = limit;
        options.offset = offset;
        const rows = await AccountMutationModel.findAll(options);

        return { data: formatResult(rows), totalRows: count };
      } else {
        const rows = await AccountMutationModel.findAll(options);

        return formatResult(rows);
      }
    } catch (error) {
      throw error;
    }
  }

  static async readOne(accountMutationId, dataUser, type) {
    try {
      const findAccountMutation = await AccountMutationModel.findOne({
        where: { AccountMutationID: accountMutationId, Type: type },
        include: [
          {
            model: AccountModel,
            required: true,
            attributes: ["AccountID", "Name", "Code"],
          },
          {
            model: AccountMutationDetailModel,
            required: true,
            include: [
              {
                model: AccountModel,
                required: true,
                attributes: ["AccountID", "Name", "Code"],
              },
            ],
          },
          {
            model: OutletModel,
            required: true,
            attributes: ["OutletID", "Name"],
            where: dataUser.OutletID
              ? { OutletID: dataUser.OutletID }
              : { EnterpriseID: dataUser.EnterpriseID },
          },
          {
            model: UserModel,
            required: true,
            attributes: ["UserID", "Name"],
            as: "Creator",
          },
          {
            model: UserModel,
            required: false,
            attributes: ["UserID", "Name"],
            as: "Updator",
          },
        ],
      });

      if (!findAccountMutation) {
        const newError = new Error("AccountMutation not found.");
        newError.status = 400;
        throw newError;
      }

      const formattedResult = {
        AccountMutationID: findAccountMutation.AccountMutationID,
        Description: findAccountMutation.Description,
        NoTransaction: findAccountMutation.NoTransaction,
        TransactionDate: findAccountMutation.TransactionDate,
        TotalAmount: parseFloat(findAccountMutation.TotalAmount),
        Type: findAccountMutation.Type,
        CreatedBy: findAccountMutation.Creator,
        UpdatedBy: findAccountMutation.Updator,
        CreatedAt: findAccountMutation.CreatedAt,
        UpdatedAt: findAccountMutation.UpdatedAt,
        Outlet: findAccountMutation.Outlet,
        Account: findAccountMutation.Account,
        AccountMutationDetails: findAccountMutation.AccountMutationDetails.map(
          (AMD) => ({
            AccountMutationDetailID: AMD.AccountMutationDetailID,
            Description: AMD.Description,
            Amount: parseFloat(AMD.Amount),
            CreatedAt: AMD.CreatedAt,
            UpdatedAt: AMD.UpdatedAt,
            Account: AMD.Account,
          })
        ),
      };

      return formattedResult;
    } catch (error) {
      throw error;
    }
  }

  static async create(dataAccountMutation, dataUser, type) {
    let transaction;
    try {
      transaction = await SparksDB.transaction();

      dataUser.OutletID = dataUser.OutletID
        ? dataUser.OutletID
        : dataAccountMutation.OutletID;

      if (!dataUser.OutletID) {
        const newError = new Error("OutletID is required");
        newError.status = 400;
        throw newError;
      }

      // Harus dari akun yang berkategori kas dan bank
      const findAccount1 = await AccountModel.findOne({
        attributes: ["AccountID"],
        where: {
          AccountID: dataAccountMutation.AccountID,
          EnterpriseID: dataUser.EnterpriseID,
          Type: "DETAIL",
        },
        include: [
          {
            model: OutletAccountModel,
            required: true,
            where: { OutletID: dataUser.OutletID },
          },
        ],
      });

      if (!findAccount1) {
        const newError = new Error("Account not found.");
        newError.status = 404;
        throw newError;
      }

      /**
       * REVENUE : source account ada di details dan destination account ada di root
       * EXPENSE : source account ada di root dan destination account ada di details
       */

      // Create the account mutation record
      const createAccountMutation = await AccountMutationModel.create(
        {
          EnterpriseID: dataUser.EnterpriseID,
          OutletID: dataUser.OutletID,
          AccountID: dataAccountMutation.AccountID,
          NoTransaction: dataAccountMutation.NoTransaction,
          Description: dataAccountMutation.Description,
          TransactionDate: dataAccountMutation.TransactionDate,
          Type: type,
          CreatedBy: dataUser.UserID,
        },
        { transaction }
      );

      let totalAmount = 0;
      const mutationDetailPromises =
        dataAccountMutation.AccountMutationDetails.map(async (AMD) => {
          // Check if the destination account exists
          const findAccount2 = await AccountModel.findOne({
            attributes: ["AccountID"],
            where: {
              AccountID: AMD.AccountID,
              EnterpriseID: dataUser.EnterpriseID,
              Type: "DETAIL",
            },
            include: [
              {
                model: OutletAccountModel,
                required: true,
                where: { OutletID: dataUser.OutletID },
              },
            ],
          });

          if (!findAccount2) {
            const newError = new Error("Account not found.");
            newError.status = 404;
            throw newError;
          }

          // Create mutation detail record
          await AccountMutationDetailModel.create(
            {
              AccountMutationID: createAccountMutation.AccountMutationID,
              AccountID: AMD.AccountID,
              Description: AMD.Description,
              Amount: AMD.Amount,
            },
            { transaction }
          );

          totalAmount += parseFloat(AMD.Amount) || 0;

          let balanceUpdate = "";
          if (type === "REVENUE") {
            balanceUpdate = `- ${parseFloat(AMD.Amount)}`;
          } else if (type === "EXPENSE") {
            balanceUpdate = `+ ${parseFloat(AMD.Amount)}`;
          } else {
            throw new Error(`Invalid type provided = ${type}`);
          }

          // Update destination account balance
          await OutletAccountModel.update(
            {
              Balance: SparksDB.literal(`Balance ${balanceUpdate}`),
            },
            {
              where: {
                AccountID: AMD.AccountID,
                OutletID: dataUser.OutletID,
              },
              transaction,
            }
          );
        });

      await Promise.all(mutationDetailPromises);

      let totalAmountUpdate = "";
      if (type === "REVENUE") {
        totalAmountUpdate = `+ ${parseFloat(totalAmount)}`;
      } else if (type === "EXPENSE") {
        totalAmountUpdate = `- ${parseFloat(totalAmount)}`;
      } else {
        throw new Error(`Invalid type provided = ${type}`);
      }

      // Update source account balance
      await OutletAccountModel.update(
        {
          Balance: SparksDB.literal(`Balance ${totalAmountUpdate}`),
        },
        {
          where: {
            AccountID: dataAccountMutation.AccountID,
            OutletID: dataUser.OutletID,
          },
          transaction,
        }
      );

      // Update total amount in account mutation record
      await createAccountMutation.update(
        {
          TotalAmount: totalAmount,
        },
        {
          transaction,
        }
      );

      await transaction.commit();

      return createAccountMutation;
    } catch (error) {
      if (transaction) await transaction.rollback();

      if (error instanceof Sequelize.UniqueConstraintError) {
        const newError = new Error(error.errors[0].message);
        newError.status = 400;
        throw newError;
      }

      throw error;
    }
  }
}

module.exports = { AccountMutationRepository };
