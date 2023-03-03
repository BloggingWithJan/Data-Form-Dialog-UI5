sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sample/HowToSimpleFormDialog/control/Validator"
], function (Controller, Fragment, Validator) {
	"use strict";

	return Controller.extend("sample.HowToSimpleFormDialog.controller.View1", {
		/**
		 * @class HowToSimpleFormDialog
		 * @author bloggingwithjan.com
		 */
		onInit: function () {
			this.oValidator = new Validator();
		},
		/**
		 * @memberOf HowToSimpleFormDialog
		 * @description open the new carrier dialog, create an entry via {@link HowToSimpleFormDialog#_createDraft} and bind it to the dialog
		 */
		addNewCarrier: function () {
			var oView = this.getView();
			// create popover
			if (!this._oNewCarrierDialog) {
				this._oNewCarrierDialog = Fragment.load({
					id: oView.getId(),
					name: "sample.HowToSimpleFormDialog.view.fragments.NewCarrier",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}

			this._oNewCarrierDialog.then(function (oDialog) {
				oDialog.bindElement(this._createDraft());
				oDialog.open();
			}.bind(this));

		},
		/**
		 * @memberOf HowToSimpleFormDialog
		 * @description creates a new entry object for the CarrierCollection and returns the bindingpath
		 * you can preset values here
		 * @returns {string} sBindingPath - Binding Path
		 */
		_createDraft: function () {
			var oServiceModel = this.getView().getModel();
			var oContext = oServiceModel.createEntry("CarrierCollection", {
				batchGroupId: this._createBatchGroupId("CarrierCreation"),
				properties: {
					carrid: "",
					CARRNAME: "",
					CURRCODE: "EUR",
					URL: ""
				}
			});

			return oContext.getPath();
		},
		/**
		 * @memberOf HowToSimpleFormDialog
		 * @description adds an batchgroup to the odatamodel
		 * @param {string} sBatchGroupId
		 */
		_createBatchGroupId: function (sBatchGroupId) {
			var oServiceModel = this.getView().getModel(),
				aDeferredGroup = oServiceModel.getDeferredGroups();

			//Add a new GroupId
			if (!aDeferredGroup.includes(sBatchGroupId)) {
				aDeferredGroup.push(sBatchGroupId);
				oServiceModel.setDeferredGroups(aDeferredGroup);
			}
		},
		/**
		 * @memberOf HowToSimpleFormDialog
		 * @description save the dialog entry
		 * <ol>
		 * <li>First validate the form via the validtor</li>
		 * <li>If everything is fine submit the changes</li>
		 * <li>If not, do nothing, user sees the valuestatetexts that got triggered via the validator</li>
		 * </ol>
		 */
		save: function () {
			var oServiceModel = this.getView().getModel();
			this._oNewCarrierDialog.then(function (oDialog) {
				if (this.oValidator.validate(oDialog)) {
					oServiceModel.submitChanges({
						groupId: "CarrierCreation",
						success: function (data) {
							debugger;
							oDialog.close();
						},
						error: function (err) {
							debugger;
							oDialog.close();
						}
					});
				}
			}.bind(this));
		},
		/**
		 * @memberOf HowToSimpleFormDialog
		 * @description Cancel the dialog
		 * <ol>
		 * <li>discard changes from the odatamodel</li>
		 * <li>clear valuestates via validator</li>
		 * <li>close the dialog</li>
		 * </ol>
		 */
		cancel: function () {
			var oServiceModel = this.getView().getModel();
			this._oNewCarrierDialog.then(function (oDialog) {
				oServiceModel.resetChanges([oDialog.getBindingContext().getPath()], undefined, true); //"delete" the created entry
				this.oValidator.clearValueState(oDialog); //clear valuestates
				oDialog.close();
			}.bind(this));
		}
	});
});