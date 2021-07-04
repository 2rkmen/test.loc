/**
 * angular-schema-form-nwp-file-upload - Upload file type for Angular Schema Form
 * @version v0.1.5
 * @link https://github.com/saburab/angular-schema-form-nwp-file-upload
 * @license MIT
 */
'use strict';

angular
   .module('schemaForm')
   .config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
      function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
         var defaultPatternMsg  = 'Wrong file type. Allowed types are ',
             defaultMaxSizeMsg1 = 'This file is too large. Maximum size allowed is ',
             defaultMaxSizeMsg2 = 'Current file size:',
             defaultMinItemsMsg = 'You have to upload at least one file',
             defaultMaxItemsMsg = 'You can\'t upload more than one file.';

         var nwpSinglefileUpload = function (name, schema, options) {
            if (schema.type === 'array' && schema.format === 'singlefile') {
               if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                  schema.pattern.validationMessage = defaultPatternMsg;
               }
               if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                  schema.maxSize.validationMessage  = defaultMaxSizeMsg1;
                  schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
               }
               if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                  schema.minItems.validationMessage = defaultMinItemsMsg;
               }
               if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                  schema.maxItems.validationMessage = defaultMaxItemsMsg;
               }

               var f                                                  = schemaFormProvider.stdFormObj(name, schema, options);
               f.key                                                  = options.path;
               f.type                                                 = 'nwpFileUpload';
               options.lookup[sfPathProvider.stringify(options.path)] = f;
               return f;
            }
         };

         schemaFormProvider.defaults.array.unshift(nwpSinglefileUpload);

         var nwpMultifileUpload = function (name, schema, options) {
            if (schema.type === 'array' && schema.format === 'multifile') {
               if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                  schema.pattern.validationMessage = defaultPatternMsg;
               }
               if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                  schema.maxSize.validationMessage  = defaultMaxSizeMsg1;
                  schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
               }
               if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                  schema.minItems.validationMessage = defaultMinItemsMsg;
               }
               if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                  schema.maxItems.validationMessage = defaultMaxItemsMsg;
               }

               var f                                                  = schemaFormProvider.stdFormObj(name, schema, options);
               f.key                                                  = options.path;
               f.type                                                 = 'nwpFileUpload';
               options.lookup[sfPathProvider.stringify(options.path)] = f;
               return f;
            }
         };

         schemaFormProvider.defaults.array.unshift(nwpMultifileUpload);

         schemaFormDecoratorsProvider.addMapping(
            'bootstrapDecorator',
            'nwpFileUpload',
            'directives/decorators/bootstrap/nwp-file/nwp-file.html'
         );
      }
   ]);

angular
   .module('ngSchemaFormFile', [
      'ngFileUpload',
      'ngMessages'
   ])
   .directive('ngSchemaFile', ['Upload', '$timeout', '$window', '$q', '$http', function (Upload, $timeout, $window, $q, $http) {
      return {
         restrict: 'A',
         scope:    true,
         require:  'ngModel',
         link: function (scope, element, attrs, ngModel) {
            scope.url = scope.form && scope.form.endpoint;
            scope.isSinglefileUpload = scope.form && scope.form.schema && scope.form.schema.format === 'singlefile';
			scope.endpoint = null;
			$window.console.info(scope.picFile);
			scope.lastState = "init";
			
			scope.deleteFile = function(url) {
				$http.delete(url).then(function (data) {
					$window.console.log("deleteFile status: " + data.status);
					scope.endpoint = null; 
                }).catch(function (data) {
					$window.console.log("deleteFile status: " + data.status);
					scope.endpoint = null; 
                });
				scope.lastState = "init";
			};
			
			// get and view default model 
			scope.defModel = eval("scope." + attrs.ngModel);
			$window.console.info(scope.defModel);
			if(scope.defModel) {
				scope.endpoint = scope.defModel.url;
				scope.filename = scope.defModel.filename;
				$window.console.log("name: " + scope.filename);
				$window.console.log("endpoint: " + scope.endpoint);
				scope.lastState = "default";
			}
			
			scope.newRemove = function(point) {
				scope.deleteFile(point);
			};
			
            scope.selectFile  = function (file) {
			   $window.console.log("selectFile");
               if(file != null) {
                  // write to getter value and replace not print chars
                  var filename = file.name.toString().split('.');
                  var newname = scope.form.title.toString();
                  newname = newname.replace(/\//g, " ");
                  newname = newname.replace(/\*/g, " ");
                  newname = newname.replace(/\\/g, " ");
                  newname = newname.replace(/-/g, " ");
				  newname = newname.replace(/,/g, " ");
				  newname = newname.replace(/:/g, " ");
                  filename[0] = (newname.length > 70) ? newname.substr(0, 70) : newname;
                  var name = ((filename[0]) ? filename[0] : "") + "." + ((filename.length > 0) ? filename[filename.length - 1] : "");
                  Object.defineProperty(file, 'name', {
                     value: name,
                     writable: true
                  });
                  $window.console.info(file);
               }
               scope.picFile = file;
			   scope.lastState = "select";
			   if(!scope.url) {
                   var reader = new FileReader();
                   reader.readAsDataURL(file);
                   reader.onload = function () {
                       ngModel.$setViewValue({name: file.name, mimeType: file.type, data: btoa(reader.result)});
                       ngModel.$commitViewValue();
                   };
                   reader.onerror = function (error) {
                       console.log('Error: ', error);
                   };
               }
                scope.$broadcast('schemaFormValidate');
            };

            scope.selectFiles = function (files) {
               scope.picFiles = files;
            };

            scope.uploadFile = function (file) {
               file && doUpload(file);
            };

            scope.removeFile = function (file) {
               $window.console.log("removeFile");
               $window.console.info(file);
               scope.picFile = null;
			   scope.lastState = "remove";
			   scope.$broadcast('schemaFormValidate');
            };

            scope.abortFile = function (file) {
//               $window.console.log("abortFile");
//               $window.console.info(file);
               if(file.upload != undefined) {
                  scope.picFile.upload.abort();
//                  $window.console.info(file);
               }
               else
               {
                  scope.picFile = null;
               }
            };

            scope.uploadFiles = function (files) {
               files.length && angular.forEach(files, function (file) {
                  doUpload(file);
               });
            };

            function doUpload(file) {
               if (file && !file.$error && scope.url) {
                  file.upload = Upload.upload({
                     url:  scope.url,
                     file: file
                  });

                  file.upload.then(function (response) {
                     $timeout(function () {
                        file.result = response.data;
                     });
                     ngModel.$setViewValue(response.data);
                     ngModel.$commitViewValue();
//					 $window.console.info(file);
					 scope.lastState = "upload";
					 scope.$broadcast('schemaFormValidate');
                  }, function (response) {
                     if (response.status > 0) {
                        scope.errorMsg = response.status + ': ' + response.data;
                     }
                  });

                  file.upload.progress(function (evt) {
                     file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                  });
               }
            }

            scope.validateField = function () {
				$window.console.log("validateField");
               if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                  console.log('singlefile-form is valid');
				  
				  if(scope.lastState == "select") {
					if (scope.form.required == true) ngModel.$setValidity('required', false);
				  }
				  else
				  {
					if (scope.form.required == true) ngModel.$setValidity('required', true);
				  }
				  
               } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
                  console.log('multifile-form is  valid');
               } else {
                  console.log('single- and multifile-form are invalid');
				  ngModel.$setDirty();
				  
				  if(scope.picFile == null) {
				  	if(scope.lastState == "default") {
						if (scope.form.required == true) {
							ngModel.$setValidity('required', true);
							element.removeClass("ng-invalid-required");
							scope.uploadForm.$error.required = undefined;
						}
					}
					else
					{
						if (scope.form.required == true) ngModel.$setValidity('required', false);
					}
				  }
				  else
				  {
					if (scope.form.required == true) ngModel.$setValidity('required', true);
				  }
               }
            };
            scope.submit = function () {
               if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                  scope.uploadFile(scope.picFile);
               } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
                  scope.uploadFiles(scope.picFiles);
               }
            };
            scope.$on('schemaFormValidate', scope.validateField);
            scope.$on('schemaFormFileUploadSubmit', scope.submit);
         }
      };
   }]);

angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/nwp-file/nwp-file.html","<ng-form class=\"file-upload mb-lg\" ng-schema-file ng-model=\"$$value$$\" name=\"uploadForm\">\n   <label ng-show=\"form.title && form.notitle !== true\" class=\"control-label\" for=\"fileInputButton\" ng-class=\"{\'sr-only\': !showTitle(), \'text-danger\': uploadForm.$error.required && !uploadForm.$pristine}\">\n      {{ form.title }}<i ng-show=\"form.required\">&nbsp;*</i>\n   </label>\n\n   <div ng-hide=\"picFile || !endpoint\">\n      <div ng-include=\"\'defaultUpload.html\'\" class=\"mb\"></div>\n   </div>\n\n   <div ng-show=\"picFile\">\n      <div ng-include=\"\'uploadProcess.html\'\" class=\"mb\"></div>\n   </div>\n   </div>\n\n   <ul ng-show=\"picFiles && picFiles.length\" class=\"list-group\">\n      <li class=\"list-group-item\" ng-repeat=\"picFile in picFiles\">\n         <div ng-include=\"\'uploadProcess.html\'\"></div>\n      </li>\n   </ul>\n\n   <div class=\"well well-sm bg-white mb\" ng-class=\"{\'has-error border-danger\': (uploadForm.$error.required && !uploadForm.$pristine) || (hasError() && errorMessage(schemaError()))}\">\n      <small class=\"text-muted\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></small>\n      <div ng-if=\"isSinglefileUpload\" ng-include=\"\'singleFileUpload.html\'\"></div>\n      <div ng-if=\"!isSinglefileUpload\" ng-include=\"\'multiFileUpload.html\'\"></div>\n      <div class=\"help-block mb0\" ng-show=\"uploadForm.$error.required && !uploadForm.$pristine\">Не заполнено обязательное поле *</div>\n      <div class=\"help-block mb0\" ng-show=\"(hasError() && errorMessage(schemaError()))\" ng-bind-html=\"(hasError() && errorMessage(schemaError()))\"></div>\n      <div ng-messages=\"uploadForm.$error\" ng-messages-multiple=\"\">\n         <div class=\"text-danger errorMsg\" ng-message=\"maxSize\">{{form.schema.maxSize.validationMessage}}{{form.schema.maxSize.maximum}}</div>\n      </div>\n   </div>\n</ng-form>\n\n<script type=\'text/ng-template\' id=\"defaultUpload.html\">\n    <div class=\"row mb\">\n       <div class=\"col-sm-4 mb-sm\">\n		 <label title=\"Предпросмотр\" class=\"text-info\">Предпросмотр</label>\n         <img src=\"{{endpoint}}\" class=\"img-thumbnail img-responsive\">\n       </div>\n\n		<div class=\"col-sm-4 mb-sm\">\n		   <label title=\"Имя файла\" class=\"text-info\">Имя файла</label>\n		    <a href=\"{{endpoint}}\"><div class=\'filename\' title=\'Скачать файл\'>{{filename}}</div></a>\n		</div>\n\n		<div class=\"col-sm-4 mb-sm text-right\">\n           <button class=\"btn btn-danger btn-sm\" type=\"button\" title=\'Удалить файл и загрузить новый\' ng-click=\"newRemove(endpoint)\">\n		   <span class=\"glyphicon glyphicon-trash\"></span> Удалить</button>\n		</div>\n	</div>\n	<div class=\"alert alert-success\" align=\"center\" ng-show=\"lastState==\'default\'\">\n		Чтобы загрузить новый файл, удалите предыдущий или загрузите новый файл\n    </div>\n</script>\n\n<script type=\'text/ng-template\' id=\"uploadProcess.html\">\n   <div class=\"row mb\">\n      <div class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.preview\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.preview\' | translate }}</label>\n         <img ngf-src=\"picFile\" class=\"img-thumbnail img-responsive\">\n         <div class=\"img-placeholder\"\n              ng-class=\"{\'show\': picFile.$invalid && !picFile.blobUrl, \'hide\': !picFile || picFile.blobUrl}\">Просмотр документа не доступен\n		 </div>\n      </div>\n      <div class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.filename\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.filename\' | translate }}</label>\n         <div class=\"filename\" title=\"{{ picFile.name }}\">{{ picFile.name }}</div>\n      </div>\n      <div ng-show=\"url\" class=\"col-sm-4 mb-sm\">\n         <label title=\"{{ \'modules.upload.field.progress\' | translate }}\" class=\"text-info\">{{\n            \'modules.upload.field.progress\' | translate }}</label>\n         <div class=\"progress\">\n            <div class=\"progress-bar progress-bar-striped\" role=\"progressbar\"\n                 ng-class=\"{\'progress-bar-success\': picFile.progress == 100}\"\n                 ng-style=\"{width: picFile.progress + \'%\'}\">\n               {{ picFile.progress }} %\n            </div>\n         </div>\n         <button class=\"btn btn-primary btn-sm\" type=\"button\" ng-click=\"uploadFile(picFile)\"\n                 ng-disabled=\"!picFile || picFile.$error\">Загрузить\n         </button>\n          <button class=\"btn btn-danger btn-sm\" type=\"button\" ng-click=\"removeFile(picFile)\"\n                  ng-show=\"picFile\" ng-disabled=\"!picFile\"><span class=\"glyphicon glyphicon-trash\"></span> Удалить\n          </button>\n<!--          <button class=\"btn btn-alert btn-sm\" type=\"button\" ng-click=\"abortFile(picFile)\"\n                  ng-show=\"picFile\" ng-disabled=\"!picFile || picFile.$error\">Отменить\n          </button> -->\n      </div>\n   </div>\n\n   <div ng-show=\"url\" class=\"alert alert-danger\" align=\"center\" ng-show=\"lastState==\'select\'\">\n		<strong>Внимание</strong> Для загрузки файла нажмите кнопку <strong>Загрузить</strong>\n   </div>\n\n   <div ng-messages=\"uploadForm.$error\" ng-messages-multiple=\"\">\n      <div class=\"text-danger errorMsg\" ng-message=\"maxSize\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong>. ({{ form.schema[picFile.$error].validationMessage2 | translate }} <strong>{{picFile.size / 1000000|number:1}}MB</strong>)</div>\n      <div class=\"text-danger errorMsg\" ng-message=\"pattern\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-message=\"maxItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-message=\"minItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\n      <div class=\"text-danger errorMsg\" ng-show=\"errorMsg\">{{errorMsg}}</div>\n   </div>\n</script>\n\n<script type=\'text/ng-template\' id=\"singleFileUpload.html\">\n   <div ngf-drop=\"selectFile(picFile)\" ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\"\n        ng-model=\"picFile\" name=\"file\"\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n        ng-required=\"form.required\"\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\n      <p class=\"text-center\">{{ \'modules.upload.descriptionSinglefile\' | translate }}</p>\n   </div>\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\n\n   <button ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\" ng-model=\"picFile\" name=\"file\"\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n           ng-required=\"form.required\"\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\n      {{ \"buttons.add\" | translate }}\n   </button>\n</script>\n\n<script type=\'text/ng-template\' id=\"multiFileUpload.html\">\n   <div ngf-drop=\"selectFiles(picFiles)\" ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\"\n        ng-model=\"picFiles\" name=\"files\"\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n        ng-required=\"form.required\"\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\n      <p class=\"text-center\">{{ \'modules.upload.descriptionMultifile\' | translate }}</p>\n   </div>\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\n\n   <button ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\" multiple ng-model=\"picFiles\" name=\"files\"\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\n           ng-required=\"form.required\"\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\n      {{ \"buttons.add\" | translate }}\n   </button>\n</script>\n");}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVtYS1mb3JtLWZpbGUuanMiLCJ0ZW1wbGF0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs4RUN6UUEiLCJmaWxlIjoic2NoZW1hLWZvcm0tZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhclxuICAgLm1vZHVsZSgnc2NoZW1hRm9ybScpXG4gICAuY29uZmlnKFsnc2NoZW1hRm9ybVByb3ZpZGVyJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLFxuICAgICAgZnVuY3Rpb24gKHNjaGVtYUZvcm1Qcm92aWRlciwgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlciwgc2ZQYXRoUHJvdmlkZXIpIHtcbiAgICAgICAgIHZhciBkZWZhdWx0UGF0dGVybk1zZyAgPSAnV3JvbmcgZmlsZSB0eXBlLiBBbGxvd2VkIHR5cGVzIGFyZSAnLFxuICAgICAgICAgICAgIGRlZmF1bHRNYXhTaXplTXNnMSA9ICdUaGlzIGZpbGUgaXMgdG9vIGxhcmdlLiBNYXhpbXVtIHNpemUgYWxsb3dlZCBpcyAnLFxuICAgICAgICAgICAgIGRlZmF1bHRNYXhTaXplTXNnMiA9ICdDdXJyZW50IGZpbGUgc2l6ZTonLFxuICAgICAgICAgICAgIGRlZmF1bHRNaW5JdGVtc01zZyA9ICdZb3UgaGF2ZSB0byB1cGxvYWQgYXQgbGVhc3Qgb25lIGZpbGUnLFxuICAgICAgICAgICAgIGRlZmF1bHRNYXhJdGVtc01zZyA9ICdZb3UgY2FuXFwndCB1cGxvYWQgbW9yZSB0aGFuIG9uZSBmaWxlLic7XG5cbiAgICAgICAgIHZhciBud3BTaW5nbGVmaWxlVXBsb2FkID0gZnVuY3Rpb24gKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5mb3JtYXQgPT09ICdzaW5nbGVmaWxlJykge1xuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5wYXR0ZXJuICYmIHNjaGVtYS5wYXR0ZXJuLm1pbWVUeXBlICYmICFzY2hlbWEucGF0dGVybi52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgc2NoZW1hLnBhdHRlcm4udmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0UGF0dGVybk1zZztcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWF4U2l6ZSAmJiBzY2hlbWEubWF4U2l6ZS5tYXhpbXVtICYmICFzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UgID0gZGVmYXVsdE1heFNpemVNc2cxO1xuICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UyID0gZGVmYXVsdE1heFNpemVNc2cyO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5taW5JdGVtcyAmJiBzY2hlbWEubWluSXRlbXMubWluaW11bSAmJiAhc2NoZW1hLm1pbkl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICBzY2hlbWEubWluSXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWluSXRlbXNNc2c7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBpZiAoc2NoZW1hLm1heEl0ZW1zICYmIHNjaGVtYS5tYXhJdGVtcy5tYXhpbXVtICYmICFzY2hlbWEubWF4SXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcbiAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgdmFyIGYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgIGYua2V5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IG9wdGlvbnMucGF0aDtcbiAgICAgICAgICAgICAgIGYudHlwZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICdud3BGaWxlVXBsb2FkJztcbiAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XG4gICAgICAgICAgICAgICByZXR1cm4gZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH07XG5cbiAgICAgICAgIHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5hcnJheS51bnNoaWZ0KG53cFNpbmdsZWZpbGVVcGxvYWQpO1xuXG4gICAgICAgICB2YXIgbndwTXVsdGlmaWxlVXBsb2FkID0gZnVuY3Rpb24gKG5hbWUsIHNjaGVtYSwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHNjaGVtYS50eXBlID09PSAnYXJyYXknICYmIHNjaGVtYS5mb3JtYXQgPT09ICdtdWx0aWZpbGUnKSB7XG4gICAgICAgICAgICAgICBpZiAoc2NoZW1hLnBhdHRlcm4gJiYgc2NoZW1hLnBhdHRlcm4ubWltZVR5cGUgJiYgIXNjaGVtYS5wYXR0ZXJuLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICBzY2hlbWEucGF0dGVybi52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRQYXR0ZXJuTXNnO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhTaXplICYmIHNjaGVtYS5tYXhTaXplLm1heGltdW0gJiYgIXNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICBzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZSAgPSBkZWZhdWx0TWF4U2l6ZU1zZzE7XG4gICAgICAgICAgICAgICAgICBzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZTIgPSBkZWZhdWx0TWF4U2l6ZU1zZzI7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBpZiAoc2NoZW1hLm1pbkl0ZW1zICYmIHNjaGVtYS5taW5JdGVtcy5taW5pbXVtICYmICFzY2hlbWEubWluSXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgIHNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNaW5JdGVtc01zZztcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWF4SXRlbXMgJiYgc2NoZW1hLm1heEl0ZW1zLm1heGltdW0gJiYgIXNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heEl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdE1heEl0ZW1zTXNnO1xuICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICB2YXIgZiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBzY2hlbWFGb3JtUHJvdmlkZXIuc3RkRm9ybU9iaihuYW1lLCBzY2hlbWEsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgZi5rZXkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gb3B0aW9ucy5wYXRoO1xuICAgICAgICAgICAgICAgZi50eXBlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJ253cEZpbGVVcGxvYWQnO1xuICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcbiAgICAgICAgICAgICAgIHJldHVybiBmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgfTtcblxuICAgICAgICAgc2NoZW1hRm9ybVByb3ZpZGVyLmRlZmF1bHRzLmFycmF5LnVuc2hpZnQobndwTXVsdGlmaWxlVXBsb2FkKTtcblxuICAgICAgICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxuICAgICAgICAgICAgJ2Jvb3RzdHJhcERlY29yYXRvcicsXG4gICAgICAgICAgICAnbndwRmlsZVVwbG9hZCcsXG4gICAgICAgICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2Jvb3RzdHJhcC9ud3AtZmlsZS9ud3AtZmlsZS5odG1sJ1xuICAgICAgICAgKTtcbiAgICAgIH1cbiAgIF0pO1xuXG5hbmd1bGFyXG4gICAubW9kdWxlKCduZ1NjaGVtYUZvcm1GaWxlJywgW1xuICAgICAgJ25nRmlsZVVwbG9hZCcsXG4gICAgICAnbmdNZXNzYWdlcydcbiAgIF0pXG4gICAuZGlyZWN0aXZlKCduZ1NjaGVtYUZpbGUnLCBbJ1VwbG9hZCcsICckdGltZW91dCcsICckd2luZG93JywgJyRxJywgJyRodHRwJywgZnVuY3Rpb24gKFVwbG9hZCwgJHRpbWVvdXQsICR3aW5kb3csICRxLCAkaHR0cCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICBzY29wZTogICAgdHJ1ZSxcbiAgICAgICAgIHJlcXVpcmU6ICAnbmdNb2RlbCcsXG4gICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsKSB7XG4gICAgICAgICAgICBzY29wZS51cmwgPSBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0uZW5kcG9pbnQ7XG4gICAgICAgICAgICBzY29wZS5pc1NpbmdsZWZpbGVVcGxvYWQgPSBzY29wZS5mb3JtICYmIHNjb3BlLmZvcm0uc2NoZW1hICYmIHNjb3BlLmZvcm0uc2NoZW1hLmZvcm1hdCA9PT0gJ3NpbmdsZWZpbGUnO1xuXHRcdFx0c2NvcGUuZW5kcG9pbnQgPSBudWxsO1xuXHRcdFx0JHdpbmRvdy5jb25zb2xlLmluZm8oc2NvcGUucGljRmlsZSk7XG5cdFx0XHRzY29wZS5sYXN0U3RhdGUgPSBcImluaXRcIjtcblx0XHRcdFxuXHRcdFx0c2NvcGUuZGVsZXRlRmlsZSA9IGZ1bmN0aW9uKHVybCkge1xuXHRcdFx0XHQkaHR0cC5kZWxldGUodXJsKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5jb25zb2xlLmxvZyhcImRlbGV0ZUZpbGUgc3RhdHVzOiBcIiArIGRhdGEuc3RhdHVzKTtcblx0XHRcdFx0XHRzY29wZS5lbmRwb2ludCA9IG51bGw7IFxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5jb25zb2xlLmxvZyhcImRlbGV0ZUZpbGUgc3RhdHVzOiBcIiArIGRhdGEuc3RhdHVzKTtcblx0XHRcdFx0XHRzY29wZS5lbmRwb2ludCA9IG51bGw7IFxuICAgICAgICAgICAgICAgIH0pO1xuXHRcdFx0XHRzY29wZS5sYXN0U3RhdGUgPSBcImluaXRcIjtcblx0XHRcdH07XG5cdFx0XHRcblx0XHRcdC8vIGdldCBhbmQgdmlldyBkZWZhdWx0IG1vZGVsIFxuXHRcdFx0c2NvcGUuZGVmTW9kZWwgPSBldmFsKFwic2NvcGUuXCIgKyBhdHRycy5uZ01vZGVsKTtcblx0XHRcdCR3aW5kb3cuY29uc29sZS5pbmZvKHNjb3BlLmRlZk1vZGVsKTtcblx0XHRcdGlmKHNjb3BlLmRlZk1vZGVsKSB7XG5cdFx0XHRcdHNjb3BlLmVuZHBvaW50ID0gc2NvcGUuZGVmTW9kZWwudXJsO1xuXHRcdFx0XHRzY29wZS5maWxlbmFtZSA9IHNjb3BlLmRlZk1vZGVsLmZpbGVuYW1lO1xuXHRcdFx0XHQkd2luZG93LmNvbnNvbGUubG9nKFwibmFtZTogXCIgKyBzY29wZS5maWxlbmFtZSk7XG5cdFx0XHRcdCR3aW5kb3cuY29uc29sZS5sb2coXCJlbmRwb2ludDogXCIgKyBzY29wZS5lbmRwb2ludCk7XG5cdFx0XHRcdHNjb3BlLmxhc3RTdGF0ZSA9IFwiZGVmYXVsdFwiO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRzY29wZS5uZXdSZW1vdmUgPSBmdW5jdGlvbihwb2ludCkge1xuXHRcdFx0XHRzY29wZS5kZWxldGVGaWxlKHBvaW50KTtcblx0XHRcdH07XG5cdFx0XHRcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdEZpbGUgID0gZnVuY3Rpb24gKGZpbGUpIHtcblx0XHRcdCAgICR3aW5kb3cuY29uc29sZS5sb2coXCJzZWxlY3RGaWxlXCIpO1xuICAgICAgICAgICAgICAgaWYoZmlsZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAvLyB3cml0ZSB0byBnZXR0ZXIgdmFsdWUgYW5kIHJlcGxhY2Ugbm90IHByaW50IGNoYXJzXG4gICAgICAgICAgICAgICAgICB2YXIgZmlsZW5hbWUgPSBmaWxlLm5hbWUudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgICAgICAgdmFyIG5ld25hbWUgPSBzY29wZS5mb3JtLnRpdGxlLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgICBuZXduYW1lID0gbmV3bmFtZS5yZXBsYWNlKC9cXC8vZywgXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgbmV3bmFtZSA9IG5ld25hbWUucmVwbGFjZSgvXFwqL2csIFwiIFwiKTtcbiAgICAgICAgICAgICAgICAgIG5ld25hbWUgPSBuZXduYW1lLnJlcGxhY2UoL1xcXFwvZywgXCIgXCIpO1xuICAgICAgICAgICAgICAgICAgbmV3bmFtZSA9IG5ld25hbWUucmVwbGFjZSgvLS9nLCBcIiBcIik7XG5cdFx0XHRcdCAgbmV3bmFtZSA9IG5ld25hbWUucmVwbGFjZSgvLC9nLCBcIiBcIik7XG5cdFx0XHRcdCAgbmV3bmFtZSA9IG5ld25hbWUucmVwbGFjZSgvOi9nLCBcIiBcIik7XG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZVswXSA9IChuZXduYW1lLmxlbmd0aCA+IDcwKSA/IG5ld25hbWUuc3Vic3RyKDAsIDcwKSA6IG5ld25hbWU7XG4gICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9ICgoZmlsZW5hbWVbMF0pID8gZmlsZW5hbWVbMF0gOiBcIlwiKSArIFwiLlwiICsgKChmaWxlbmFtZS5sZW5ndGggPiAwKSA/IGZpbGVuYW1lW2ZpbGVuYW1lLmxlbmd0aCAtIDFdIDogXCJcIik7XG4gICAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZmlsZSwgJ25hbWUnLCB7XG4gICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICR3aW5kb3cuY29uc29sZS5pbmZvKGZpbGUpO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgc2NvcGUucGljRmlsZSA9IGZpbGU7XG5cdFx0XHQgICBzY29wZS5sYXN0U3RhdGUgPSBcInNlbGVjdFwiO1xuXHRcdFx0ICAgaWYoIXNjb3BlLnVybCkge1xuICAgICAgICAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZSh7bmFtZTogZmlsZS5uYW1lLCBtaW1lVHlwZTogZmlsZS50eXBlLCBkYXRhOiBidG9hKHJlYWRlci5yZXN1bHQpfSk7XG4gICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWwuJGNvbW1pdFZpZXdWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yOiAnLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdzY2hlbWFGb3JtVmFsaWRhdGUnKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdEZpbGVzID0gZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICBzY29wZS5waWNGaWxlcyA9IGZpbGVzO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUudXBsb2FkRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICAgICBmaWxlICYmIGRvVXBsb2FkKGZpbGUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUucmVtb3ZlRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICAgICAkd2luZG93LmNvbnNvbGUubG9nKFwicmVtb3ZlRmlsZVwiKTtcbiAgICAgICAgICAgICAgICR3aW5kb3cuY29uc29sZS5pbmZvKGZpbGUpO1xuICAgICAgICAgICAgICAgc2NvcGUucGljRmlsZSA9IG51bGw7XG5cdFx0XHQgICBzY29wZS5sYXN0U3RhdGUgPSBcInJlbW92ZVwiO1xuXHRcdFx0ICAgc2NvcGUuJGJyb2FkY2FzdCgnc2NoZW1hRm9ybVZhbGlkYXRlJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5hYm9ydEZpbGUgPSBmdW5jdGlvbiAoZmlsZSkge1xuLy8gICAgICAgICAgICAgICAkd2luZG93LmNvbnNvbGUubG9nKFwiYWJvcnRGaWxlXCIpO1xuLy8gICAgICAgICAgICAgICAkd2luZG93LmNvbnNvbGUuaW5mbyhmaWxlKTtcbiAgICAgICAgICAgICAgIGlmKGZpbGUudXBsb2FkICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgc2NvcGUucGljRmlsZS51cGxvYWQuYWJvcnQoKTtcbi8vICAgICAgICAgICAgICAgICAgJHdpbmRvdy5jb25zb2xlLmluZm8oZmlsZSk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBzY29wZS5waWNGaWxlID0gbnVsbDtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnVwbG9hZEZpbGVzID0gZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICAgICBmaWxlcy5sZW5ndGggJiYgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgZG9VcGxvYWQoZmlsZSk7XG4gICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvVXBsb2FkKGZpbGUpIHtcbiAgICAgICAgICAgICAgIGlmIChmaWxlICYmICFmaWxlLiRlcnJvciAmJiBzY29wZS51cmwpIHtcbiAgICAgICAgICAgICAgICAgIGZpbGUudXBsb2FkID0gVXBsb2FkLnVwbG9hZCh7XG4gICAgICAgICAgICAgICAgICAgICB1cmw6ICBzY29wZS51cmwsXG4gICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgZmlsZS51cGxvYWQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucmVzdWx0ID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbC4kY29tbWl0Vmlld1ZhbHVlKCk7XG4vL1x0XHRcdFx0XHQgJHdpbmRvdy5jb25zb2xlLmluZm8oZmlsZSk7XG5cdFx0XHRcdFx0IHNjb3BlLmxhc3RTdGF0ZSA9IFwidXBsb2FkXCI7XG5cdFx0XHRcdFx0IHNjb3BlLiRicm9hZGNhc3QoJ3NjaGVtYUZvcm1WYWxpZGF0ZScpO1xuICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXJyb3JNc2cgPSByZXNwb25zZS5zdGF0dXMgKyAnOiAnICsgcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICBmaWxlLnVwbG9hZC5wcm9ncmVzcyhmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCBwYXJzZUludCgxMDAuMCAqXG4gICAgICAgICAgICAgICAgICAgICAgICBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVGaWVsZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JHdpbmRvdy5jb25zb2xlLmxvZyhcInZhbGlkYXRlRmllbGRcIik7XG4gICAgICAgICAgICAgICBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZS4kdmFsaWQgJiYgc2NvcGUucGljRmlsZSAmJiAhc2NvcGUucGljRmlsZS4kZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaW5nbGVmaWxlLWZvcm0gaXMgdmFsaWQnKTtcblx0XHRcdFx0ICBcblx0XHRcdFx0ICBpZihzY29wZS5sYXN0U3RhdGUgPT0gXCJzZWxlY3RcIikge1xuXHRcdFx0XHRcdGlmIChzY29wZS5mb3JtLnJlcXVpcmVkID09IHRydWUpIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdyZXF1aXJlZCcsIGZhbHNlKTtcblx0XHRcdFx0ICB9XG5cdFx0XHRcdCAgZWxzZVxuXHRcdFx0XHQgIHtcblx0XHRcdFx0XHRpZiAoc2NvcGUuZm9ybS5yZXF1aXJlZCA9PSB0cnVlKSBuZ01vZGVsLiRzZXRWYWxpZGl0eSgncmVxdWlyZWQnLCB0cnVlKTtcblx0XHRcdFx0ICB9XG5cdFx0XHRcdCAgXG4gICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNjb3BlLnVwbG9hZEZvcm0uZmlsZXMgJiYgc2NvcGUudXBsb2FkRm9ybS5maWxlcy4kdmFsaWQgJiYgc2NvcGUucGljRmlsZXMgJiYgIXNjb3BlLnBpY0ZpbGVzLiRlcnJvcikge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ211bHRpZmlsZS1mb3JtIGlzICB2YWxpZCcpO1xuICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaW5nbGUtIGFuZCBtdWx0aWZpbGUtZm9ybSBhcmUgaW52YWxpZCcpO1xuXHRcdFx0XHQgIG5nTW9kZWwuJHNldERpcnR5KCk7XG5cdFx0XHRcdCAgXG5cdFx0XHRcdCAgaWYoc2NvcGUucGljRmlsZSA9PSBudWxsKSB7XG5cdFx0XHRcdCAgXHRpZihzY29wZS5sYXN0U3RhdGUgPT0gXCJkZWZhdWx0XCIpIHtcblx0XHRcdFx0XHRcdGlmIChzY29wZS5mb3JtLnJlcXVpcmVkID09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0bmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3JlcXVpcmVkJywgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGVsZW1lbnQucmVtb3ZlQ2xhc3MoXCJuZy1pbnZhbGlkLXJlcXVpcmVkXCIpO1xuXHRcdFx0XHRcdFx0XHRzY29wZS51cGxvYWRGb3JtLiRlcnJvci5yZXF1aXJlZCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChzY29wZS5mb3JtLnJlcXVpcmVkID09IHRydWUpIG5nTW9kZWwuJHNldFZhbGlkaXR5KCdyZXF1aXJlZCcsIGZhbHNlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCAgfVxuXHRcdFx0XHQgIGVsc2Vcblx0XHRcdFx0ICB7XG5cdFx0XHRcdFx0aWYgKHNjb3BlLmZvcm0ucmVxdWlyZWQgPT0gdHJ1ZSkgbmdNb2RlbC4kc2V0VmFsaWRpdHkoJ3JlcXVpcmVkJywgdHJ1ZSk7XG5cdFx0XHRcdCAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGUgJiYgc2NvcGUudXBsb2FkRm9ybS5maWxlLiR2YWxpZCAmJiBzY29wZS5waWNGaWxlICYmICFzY29wZS5waWNGaWxlLiRlcnJvcikge1xuICAgICAgICAgICAgICAgICAgc2NvcGUudXBsb2FkRmlsZShzY29wZS5waWNGaWxlKTtcbiAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlcyAmJiBzY29wZS51cGxvYWRGb3JtLmZpbGVzLiR2YWxpZCAmJiBzY29wZS5waWNGaWxlcyAmJiAhc2NvcGUucGljRmlsZXMuJGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICBzY29wZS51cGxvYWRGaWxlcyhzY29wZS5waWNGaWxlcyk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBzY29wZS52YWxpZGF0ZUZpZWxkKTtcbiAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybUZpbGVVcGxvYWRTdWJtaXQnLCBzY29wZS5zdWJtaXQpO1xuICAgICAgICAgfVxuICAgICAgfTtcbiAgIH1dKTtcbiIsbnVsbF19
